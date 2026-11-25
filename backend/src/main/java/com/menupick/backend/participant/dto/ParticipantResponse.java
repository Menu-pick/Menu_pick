package com.menupick.backend.participant.dto;

import com.menupick.backend.participant.entity.Participant;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDateTime;

public record ParticipantResponse(

        @Schema(description = "참여자 ID", example = "1")
        Long participantId,

        @Schema(description = "닉네임", example = "서연")
        String nickname,

        @Schema(description = "입장 시각")
        LocalDateTime joinedAt
) {
    public static ParticipantResponse from(Participant participant) {
        return new ParticipantResponse(
                participant.getId(),
                participant.getNickname(),
                participant.getJoinedAt()
        );
    }
}
