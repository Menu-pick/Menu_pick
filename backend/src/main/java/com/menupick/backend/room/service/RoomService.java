package com.menupick.backend.room.service;

import com.menupick.backend.participant.dto.MeResponse;
import com.menupick.backend.participant.dto.ParticipantResponse;
import com.menupick.backend.participant.entity.Participant;
import com.menupick.backend.participant.repository.ParticipantRepository;
import com.menupick.backend.participant.service.ParticipantService;
import com.menupick.backend.room.dto.*;
import com.menupick.backend.room.entity.Room;
import com.menupick.backend.room.repository.RoomRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.Comparator;
import java.util.List;

@Service
public class RoomService {

    private final RoomRepository roomRepository;
    private final ParticipantRepository participantRepository;
    private final ParticipantService participantService;
    private final RoomCodeGenerator codeGenerator;

    public RoomService(
            RoomRepository roomRepository,
            ParticipantRepository participantRepository,
            ParticipantService participantService,
            RoomCodeGenerator codeGenerator
    ) {
        this.roomRepository = roomRepository;
        this.participantRepository = participantRepository;
        this.participantService = participantService;
        this.codeGenerator = codeGenerator;
    }

    // 방 생성 (생성자를 첫 참여자로 함께 등록)
    @Transactional
    public RoomJoinResponse create(RoomCreateRequest request) {
        Room room = roomRepository.save(new Room(
                request.name().trim(),
                codeGenerator.generate(),
                request.placeId(),
                request.placeName(),
                request.address(),
                request.latitude(),
                request.longitude(),
                request.mealType(),
                request.categories()
        ));

        Participant me = participantService.join(
                room.getId(),
                request.nickname()
        );

        return new RoomJoinResponse(
                RoomResponse.from(room, 1),
                MeResponse.from(me)
        );
    }

    // 코드로 참여하기
    @Transactional
    public RoomJoinResponse join(RoomJoinRequest request) {
        String code = request.code().trim().toUpperCase();

        Room room = roomRepository.findByCode(code)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "코드가 올바르지 않아요. 다시 확인해주세요."
                ));

        Participant me = participantService.join(
                room.getId(),
                request.nickname()
        );

        return new RoomJoinResponse(
                RoomResponse.from(
                        room,
                        participantRepository.countByRoomId(room.getId())
                ),
                MeResponse.from(me)
        );
    }

    // 방 설정 변경 (명세서 12·13번)
    @Transactional
    public RoomJoinResponse update(Long roomId, RoomUpdateRequest request) {
        Room room = getRoomOrThrow(roomId);

        Participant me = getParticipantOrThrow(roomId, request.participantToken());

        String nickname = request.nickname().trim();

        // 닉네임을 바꾸는 경우에만 방 안에서 중복인지 확인한다.
        if (!me.getNickname().equals(nickname)
                && participantRepository.existsByRoomIdAndNickname(roomId, nickname)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "이미 사용 중인 닉네임이에요. 다른 닉네임을 입력해주세요."
            );
        }

        me.changeNickname(nickname);

        room.update(
                request.name().trim(),
                request.placeId(),
                request.placeName(),
                request.address(),
                request.latitude(),
                request.longitude(),
                request.mealType(),
                request.categories()
        );

        return new RoomJoinResponse(
                RoomResponse.from(
                        room,
                        participantRepository.countByRoomId(roomId)
                ),
                MeResponse.from(me)
        );
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

    // 방 조회
    @Transactional(readOnly = true)
    public RoomResponse get(Long roomId) {
        Room room = getRoomOrThrow(roomId);

        return RoomResponse.from(
                room,
                participantRepository.countByRoomId(roomId)
        );
    }

    // 참여자 목록 (대기방에서 주기적으로 조회)
    @Transactional(readOnly = true)
    public List<ParticipantResponse> getParticipants(Long roomId) {
        getRoomOrThrow(roomId);

        return participantRepository
                .findByRoomIdOrderByJoinedAtAsc(roomId)
                .stream()
                .map(ParticipantResponse::from)
                .toList();
    }

    // 홈 화면: 참여 중인 방 목록 (최근 생성순)
    @Transactional(readOnly = true)
    public List<RoomResponse> getRooms(List<Long> roomIds) {
        if (roomIds == null || roomIds.isEmpty()) {
            return List.of();
        }

        return roomRepository.findAllById(roomIds).stream()
                .sorted(Comparator.comparing(
                        Room::getCreatedAt,
                        Comparator.reverseOrder()
                ))
                .map(room -> RoomResponse.from(
                        room,
                        participantRepository.countByRoomId(room.getId())
                ))
                .toList();
    }

    /**
     * 방이 존재하지 않으면 404를 반환합니다.
     * 식당 확정·식사 기록 등 다른 도메인에서 방 존재 검증용으로 사용합니다.
     */
    @Transactional(readOnly = true)
    public Room getRoomOrThrow(Long roomId) {
        if (roomId == null || roomId <= 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "올바른 방 ID를 입력해주세요."
            );
        }

        return roomRepository.findById(roomId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "존재하지 않는 방입니다."
                ));
    }
}
