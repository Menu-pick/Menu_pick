package com.menupick.backend.room.service;

import com.menupick.backend.room.dto.RoomCreateRequest;
import com.menupick.backend.room.dto.RoomResponse;
import com.menupick.backend.room.entity.Room;
import com.menupick.backend.room.repository.RoomRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class RoomService {

    private final RoomRepository roomRepository;
    private final RoomCodeGenerator codeGenerator;

    public RoomService(
            RoomRepository roomRepository,
            RoomCodeGenerator codeGenerator
    ) {
        this.roomRepository = roomRepository;
        this.codeGenerator = codeGenerator;
    }

    // 방 생성
    @Transactional
    public RoomResponse create(RoomCreateRequest request) {
        Room room = new Room(
                request.name().trim(),
                codeGenerator.generate(),
                request.placeId(),
                request.placeName(),
                request.address(),
                request.latitude(),
                request.longitude(),
                request.mealType(),
                request.categories()
        );

        return RoomResponse.from(roomRepository.save(room));
    }

    // 방 조회
    @Transactional(readOnly = true)
    public RoomResponse get(Long roomId) {
        return RoomResponse.from(getRoomOrThrow(roomId));
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
