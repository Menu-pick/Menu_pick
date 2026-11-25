package com.menupick.backend.vote.dto;

import com.menupick.backend.vote.entity.Vote;
import com.menupick.backend.vote.entity.VoteType;
import io.swagger.v3.oas.annotations.media.Schema;

public record MyVoteResponse(

        @Schema(description = "메뉴 ID", example = "11")
        Long menuId,

        @Schema(description = "내 선택")
        VoteType voteType
) {
    public static MyVoteResponse from(Vote vote) {
        return new MyVoteResponse(vote.getMenuId(), vote.getVoteType());
    }
}
