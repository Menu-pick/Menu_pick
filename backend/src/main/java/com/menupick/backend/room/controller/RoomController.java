package com.menupick.backend.room.controller;

import com.menupick.backend.participant.dto.ParticipantResponse;
import com.menupick.backend.room.dto.*;
import com.menupick.backend.room.service.RoomService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "방")
@RestController
@RequestMapping("/api/rooms")
public class RoomController {

    private final RoomService roomService;

    public RoomController(RoomService roomService) {
        this.roomService = roomService;
    }

    @Operation(summary = "방 생성", description = "방을 만들고 생성자를 첫 참여자로 등록합니다.")
    @PostMapping
    public ResponseEntity<RoomJoinResponse> createRoom(
            @Valid @RequestBody RoomCreateRequest request
    ) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(roomService.create(request));
    }

    @Operation(summary = "코드로 참여하기", description = "참여 코드로 기존 방에 입장합니다.")
    @PostMapping("/join")
    public ResponseEntity<RoomJoinResponse> joinRoom(
            @Valid @RequestBody RoomJoinRequest request
    ) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(roomService.join(request));
    }

    @Operation(summary = "방 조회")
    @GetMapping("/{roomId}")
    public RoomResponse getRoom(@PathVariable Long roomId) {
        return roomService.get(roomId);
    }

    @Operation(
            summary = "참여자 목록 조회",
            description = "대기방에서 주기적으로 호출해 참여자 목록을 갱신합니다."
    )
    @GetMapping("/{roomId}/participants")
    public List<ParticipantResponse> getParticipants(@PathVariable Long roomId) {
        return roomService.getParticipants(roomId);
    }

    @Operation(
            summary = "참여 중인 방 목록 조회",
            description = "클라이언트가 보관 중인 방 ID 목록으로 조회합니다. 최근 생성순으로 정렬됩니다."
    )
    @GetMapping
    public List<RoomResponse> getRooms(
            @Parameter(description = "참여 중인 방 ID 목록", example = "1,2,3")
            @RequestParam(required = false) List<Long> roomIds
    ) {
        return roomService.getRooms(roomIds);
    }
}
