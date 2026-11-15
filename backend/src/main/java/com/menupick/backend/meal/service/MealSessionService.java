package com.menupick.backend.meal.service;

import com.menupick.backend.meal.dto.MealSessionResponse;
import com.menupick.backend.meal.entity.MealSession;
import com.menupick.backend.meal.entity.MealStatus;
import com.menupick.backend.meal.repository.MealSessionRepository;
import com.menupick.backend.menu.entity.Menu;
import com.menupick.backend.menu.repository.MenuRepository;
import com.menupick.backend.room.entity.Room;
import com.menupick.backend.room.service.RoomService;
import com.menupick.backend.vote.repository.VoteRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.security.SecureRandom;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class MealSessionService {

    private static final int CANDIDATE_COUNT = 3;

    private final MealSessionRepository mealSessionRepository;
    private final MenuRepository menuRepository;
    private final VoteRepository voteRepository;
    private final RoomService roomService;
    private final SecureRandom random = new SecureRandom();

    public MealSessionService(
            MealSessionRepository mealSessionRepository,
            MenuRepository menuRepository,
            VoteRepository voteRepository,
            RoomService roomService
    ) {
        this.mealSessionRepository = mealSessionRepository;
        this.menuRepository = menuRepository;
        this.voteRepository = voteRepository;
        this.roomService = roomService;
    }

    /**
     * 메뉴 후보를 추첨해 식사 세션을 시작합니다.
     * 진행 중인 세션이 있으면 재추첨하지 않고 기존 후보를 그대로 반환합니다.
     * (여러 명이 버튼을 눌러도 후보가 바뀌지 않도록)
     */
    @Transactional
    public MealSessionResponse draw(Long roomId) {
        Room room = roomService.getRoomOrThrow(roomId);

        MealSession current = findCurrent(roomId);

        if (current != null && current.getStatus() == MealStatus.VOTING) {
            return MealSessionResponse.from(current);
        }

        MealSession session = mealSessionRepository.save(
                new MealSession(roomId, pickRandomMenus(room, Set.of()))
        );

        return MealSessionResponse.from(session);
    }

    /**
     * 후보가 마음에 들지 않거나 최다 득표가 동점일 때 후보를 다시 뽑습니다.
     * 기존 투표는 모두 초기화되며, 직전 후보는 제외하고 추첨합니다.
     */
    @Transactional
    public MealSessionResponse redraw(Long roomId, Long mealSessionId) {
        Room room = roomService.getRoomOrThrow(roomId);

        MealSession session = getSessionOrThrow(roomId, mealSessionId);

        if (session.getStatus() == MealStatus.CONFIRMED) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "이미 메뉴가 확정되어 다시 뽑을 수 없어요."
            );
        }

        Set<Long> previous = session.getCandidates().stream()
                .map(Menu::getId)
                .collect(Collectors.toSet());

        voteRepository.deleteByMealSessionId(mealSessionId);

        session.replaceCandidates(pickRandomMenus(room, previous));

        return MealSessionResponse.from(session);
    }

    // 현재 진행 중인(또는 가장 최근) 식사 세션 조회
    @Transactional(readOnly = true)
    public MealSessionResponse getCurrent(Long roomId) {
        roomService.getRoomOrThrow(roomId);

        MealSession current = findCurrent(roomId);

        if (current == null) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "아직 메뉴 후보를 뽑지 않았어요."
            );
        }

        return MealSessionResponse.from(current);
    }

    private MealSession findCurrent(Long roomId) {
        return mealSessionRepository
                .findFirstByRoomIdOrderByCreatedAtDesc(roomId)
                .orElse(null);
    }

    private MealSession getSessionOrThrow(Long roomId, Long mealSessionId) {
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

    /**
     * 방에서 선택한 카테고리 안에서 중복 없이 3개를 뽑습니다.
     * excluded(직전 후보)를 빼고도 3개가 남으면 제외하고 뽑아,
     * 재추첨 시 같은 메뉴가 다시 나오지 않도록 합니다.
     */
    private List<Menu> pickRandomMenus(Room room, Set<Long> excluded) {
        List<Menu> all = menuRepository.findByCategoryIn(room.getCategories());

        if (all.size() < CANDIDATE_COUNT) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "선택한 카테고리에 추천할 메뉴가 부족해요."
            );
        }

        List<Menu> pool = all.stream()
                .filter(menu -> !excluded.contains(menu.getId()))
                .collect(Collectors.toCollection(ArrayList::new));

        if (pool.size() < CANDIDATE_COUNT) {
            pool = new ArrayList<>(all);
        }

        Collections.shuffle(pool, random);

        return pool.subList(0, CANDIDATE_COUNT);
    }
}
