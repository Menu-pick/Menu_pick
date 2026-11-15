package com.menupick.backend.vote.dto;

import com.menupick.backend.meal.dto.MenuCandidateResponse;
import io.swagger.v3.oas.annotations.media.Schema;

public record MenuVoteResult(

        @Schema(description = "메뉴 정보")
        MenuCandidateResponse menu,

        @Schema(description = "좋아요 수 (순위 기준)", example = "4")
        long likeCount,

        @Schema(description = "싫어요 수 (순위에는 반영하지 않음)", example = "0")
        long dislikeCount,

        @Schema(description = "순위 (1위부터, 동률이면 같은 순위)", example = "1")
        int rank
) {
}
