package com.menupick.backend.vote.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;

public record ConfirmRequest(

        @NotBlank(message = "참여 정보가 없어요. 다시 참여해주세요.")
        @Schema(
                description = "참여 시 발급받은 본인 확인용 토큰",
                example = "3f2b1c4e-8a9d-4f21-b5c7-6e0d2a1f9b33"
        )
        String participantToken
) {
}
