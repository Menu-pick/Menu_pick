package com.menupick.backend.vote.service;

import com.menupick.backend.meal.dto.MealSessionResponse;
import com.menupick.backend.meal.dto.MenuCandidateResponse;
import com.menupick.backend.meal.entity.MealSession;
import com.menupick.backend.meal.entity.MealStatus;
import com.menupick.backend.meal.repository.MealSessionRepository;
import com.menupick.backend.menu.entity.Menu;
import com.menupick.backend.participant.entity.Participant;
import com.menupick.backend.participant.repository.ParticipantRepository;
import com.menupick.backend.room.service.RoomService;
import com.menupick.backend.vote.dto.*;
import com.menupick.backend.vote.entity.Vote;
import com.menupick.backend.vote.entity.VoteType;
import com.menupick.backend.vote.repository.VoteRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.*;

@Service
public class VoteService {

    private final VoteRepository voteRepository;
    private final MealSessionRepository mealSessionRepository;
    private final ParticipantRepository participantRepository;
    private final RoomService roomService;

    public VoteService(
            VoteRepository voteRepository,
            MealSessionRepository mealSessionRepository,
            ParticipantRepository participantRepository,
            RoomService roomService
    ) {
        this.voteRepository = voteRepository;
        this.mealSessionRepository = mealSessionRepository;
        this.participantRepository = participantRepository;
        this.roomService = roomService;
    }

    // 좋아요 / 싫어요 투표 (이미 선택한 메뉴면 변경)
    @Transactional
    public List<MyVoteResponse> vote(
            Long roomId,
            Long mealSessionId,
            VoteRequest request
    ) {
        MealSession session = getSessionOrThrow(roomId, mealSessionId);

        if (session.getStatus() == MealStatus.CONFIRMED) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "이미 메뉴가 확정되어 투표를 변경할 수 없어요."
            );
        }

        Participant me = getParticipantOrThrow(roomId, request.participantToken());

        validateCandidate(session, request.menuId());

        voteRepository
                .findByMealSessionIdAndParticipantIdAndMenuId(
                        mealSessionId, me.getId(), request.menuId()
                )
                .ifPresentOrElse(
                        vote -> vote.changeTo(request.voteType()),
                        () -> voteRepository.save(new Vote(
                                mealSessionId,
                                me.getId(),
                                request.menuId(),
                                request.voteType()
                        ))
                );

        return getMyVotes(roomId, mealSessionId, request.participantToken());
    }

    // 새로고침 후 내 선택 복원용
    @Transactional(readOnly = true)
    public List<MyVoteResponse> getMyVotes(
            Long roomId,
            Long mealSessionId,
            String participantToken
    ) {
        getSessionOrThrow(roomId, mealSessionId);

        Participant me = getParticipantOrThrow(roomId, participantToken);

        return voteRepository
                .findByMealSessionIdAndParticipantId(mealSessionId, me.getId())
                .stream()
                .map(MyVoteResponse::from)
                .toList();
    }

    // 투표 결과 (전원 투표 전에도 조회 가능)
    @Transactional(readOnly = true)
    public VoteResultResponse getResult(Long roomId, Long mealSessionId) {
        MealSession session = getSessionOrThrow(roomId, mealSessionId);

        return calculate(session, roomId);
    }

    // 최다 득표 메뉴 확정
    @Transactional
    public MealSessionResponse confirm(
            Long roomId,
            Long mealSessionId,
            ConfirmRequest request
    ) {
        MealSession session = getSessionOrThrow(roomId, mealSessionId);

        getParticipantOrThrow(roomId, request.participantToken());

        // 이미 확정된 세션은 그대로 반환한다. (여러 명이 눌러도 결과가 바뀌지 않도록)
        if (session.getStatus() == MealStatus.CONFIRMED) {
            return MealSessionResponse.from(session);
        }

        VoteResultResponse result = calculate(session, roomId);

        if (!result.allVoted()) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "아직 투표가 부족해요. 모두의 선택이 모이면 확정할 수 있어요."
            );
        }

        if (result.tie()) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "1위 메뉴가 동점이에요. 결선 투표가 필요해요."
            );
        }

        Long winnerMenuId = result.results().get(0).menu().menuId();

        Menu winner = session.getCandidates().stream()
                .filter(menu -> menu.getId().equals(winnerMenuId))
                .findFirst()
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.INTERNAL_SERVER_ERROR,
                        "확정할 메뉴를 찾지 못했어요."
                ));

        session.confirm(winner);

        return MealSessionResponse.from(session);
    }

    // --- 내부 로직 ---

    private VoteResultResponse calculate(MealSession session, Long roomId) {
        List<Vote> votes = voteRepository.findByMealSessionId(session.getId());

        Map<Long, Long> likeCounts = new HashMap<>();
        Map<Long, Long> dislikeCounts = new HashMap<>();
        Map<Long, Set<Long>> votedMenusByParticipant = new HashMap<>();

        for (Vote vote : votes) {
            if (vote.getVoteType() == VoteType.LIKE) {
                likeCounts.merge(vote.getMenuId(), 1L, Long::sum);
            } else {
                dislikeCounts.merge(vote.getMenuId(), 1L, Long::sum);
            }

            votedMenusByParticipant
                    .computeIfAbsent(vote.getParticipantId(), k -> new HashSet<>())
                    .add(vote.getMenuId());
        }

        // 좋아요 수로 정렬 (싫어요는 순위에 반영하지 않음)
        List<MenuVoteResult> sorted = new ArrayList<>(
                session.getCandidates().stream()
                        .map(menu -> new MenuVoteResult(
                                MenuCandidateResponse.from(menu),
                                likeCounts.getOrDefault(menu.getId(), 0L),
                                dislikeCounts.getOrDefault(menu.getId(), 0L),
                                0
                        ))
                        .sorted(Comparator.comparingLong(
                                MenuVoteResult::likeCount).reversed())
                        .toList()
        );

        // 동률이면 같은 순위를 부여
        List<MenuVoteResult> ranked = new ArrayList<>();

        for (int i = 0; i < sorted.size(); i++) {
            MenuVoteResult current = sorted.get(i);

            int rank = i + 1;

            for (int j = 0; j < i; j++) {
                if (sorted.get(j).likeCount() == current.likeCount()) {
                    rank = ranked.get(j).rank();
                    break;
                }
            }

            ranked.add(new MenuVoteResult(
                    current.menu(),
                    current.likeCount(),
                    current.dislikeCount(),
                    rank
            ));
        }

        // 후보 전체에 선택을 남긴 참여자만 "투표 완료"로 본다.
        int candidateCount = session.getCandidates().size();

        long votedCount = votedMenusByParticipant.values().stream()
                .filter(menus -> menus.size() >= candidateCount)
                .count();

        long totalCount = participantRepository.countByRoomId(roomId);

        boolean allVoted = totalCount > 0 && votedCount >= totalCount;

        List<MenuVoteResult> tiedMenus = ranked.stream()
                .filter(result -> result.rank() == 1)
                .toList();

        return new VoteResultResponse(
                session.getId(),
                ranked,
                votedCount,
                totalCount,
                allVoted,
                tiedMenus.size() > 1,
                tiedMenus.size() > 1 ? tiedMenus : List.of()
        );
    }

    private MealSession getSessionOrThrow(Long roomId, Long mealSessionId) {
        roomService.getRoomOrThrow(roomId);

        MealSession session = mealSessionRepository.findById(mealSessionId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "존재하지 않는 식사 세션이에요."
                ));

        if (!session.getRoomId().equals(roomId)) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "해당 방의 식사 세션이 아니에요."
            );
        }

        return session;
    }

    private Participant getParticipantOrThrow(Long roomId, String token) {
        Participant participant = participantRepository.findByToken(token)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.FORBIDDEN,
                        "참여 정보를 확인할 수 없어요. 다시 참여해주세요."
                ));

        if (!participant.getRoomId().equals(roomId)) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "이 방의 참여자가 아니에요."
            );
        }

        return participant;
    }

    private void validateCandidate(MealSession session, Long menuId) {
        boolean exists = session.getCandidates().stream()
                .anyMatch(menu -> menu.getId().equals(menuId));

        if (!exists) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "이번 추첨에 없는 메뉴예요."
            );
        }
    }
}
