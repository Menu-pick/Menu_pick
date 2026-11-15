package com.menupick.backend.vote.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.util.List;

public record VoteResultResponse(

        @Schema(description = "식사 세션 ID", example = "1")
        Long mealSessionId,

        @Schema(description = "메뉴별 결과 (좋아요 많은 순)")
        List<MenuVoteResult> results,

        @Schema(description = "투표를 마친 참여자 수", example = "3")
        long votedCount,

        @Schema(description = "전체 참여자 수", example = "4")
        long totalCount,

        @Schema(
                description = "전원 투표 완료 여부. false면 E04(투표 미완료) 화면으로 안내",
                example = "false"
        )
        boolean allVoted,

        @Schema(description = "1위가 2개 이상인지 여부", example = "false")
        boolean tie,

        @Schema(description = "동률인 메뉴 목록 (동률이 아니면 빈 배열)")
        List<MenuVoteResult> tiedMenus
) {
}
