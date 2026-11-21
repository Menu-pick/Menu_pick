package com.menupick.backend.room.dto;

import com.menupick.backend.participant.dto.MeResponse;
import io.swagger.v3.oas.annotations.media.Schema;

public record RoomJoinResponse(

        @Schema(description = "방 정보")
        RoomResponse room,

        @Schema(description = "내 참여 정보 (토큰은 이 응답에서만 반환됩니다)")
        MeResponse me
) {
}
