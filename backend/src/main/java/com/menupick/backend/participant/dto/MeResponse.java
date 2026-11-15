package com.menupick.backend.participant.dto;

import com.menupick.backend.participant.entity.Participant;
import io.swagger.v3.oas.annotations.media.Schema;

public record MeResponse(

        @Schema(description = "참여자 ID")
        Long participantId,

        @Schema(
                description = "본인 확인용 토큰 (투표 등에 사용, 클라이언트에 저장 필요)",
                example = "3f2b1c4e-8a9d-4f21-b5c7-6e0d2a1f9b33"
        )
        String participantToken,

        @Schema(description = "닉네임")
        String nickname
) {
    public static MeResponse from(Participant participant) {
        return new MeResponse(
                participant.getId(),
                participant.getToken(),
                participant.getNickname()
        );
    }
}
