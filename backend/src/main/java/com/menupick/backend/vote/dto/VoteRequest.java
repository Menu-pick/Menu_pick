package com.menupick.backend.vote.dto;

import com.menupick.backend.vote.entity.VoteType;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record VoteRequest(

        @NotBlank(message = "참여 정보가 없어요. 다시 참여해주세요.")
        @Schema(
                description = "참여 시 발급받은 본인 확인용 토큰",
                example = "3f2b1c4e-8a9d-4f21-b5c7-6e0d2a1f9b33"
        )
        String participantToken,

        @NotNull(message = "메뉴를 선택해주세요.")
        @Schema(description = "투표할 메뉴 ID", example = "11")
        Long menuId,

        @NotNull(message = "좋아요 또는 싫어요를 선택해주세요.")
        @Schema(description = "좋아요 / 싫어요", example = "LIKE")
        VoteType voteType
) {
}
