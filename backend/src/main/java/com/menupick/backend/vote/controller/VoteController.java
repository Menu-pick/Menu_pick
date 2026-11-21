package com.menupick.backend.vote.controller;

import com.menupick.backend.meal.dto.MealSessionResponse;
import com.menupick.backend.vote.dto.*;
import com.menupick.backend.vote.service.VoteService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;

import jakarta.validation.Valid;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "메뉴 투표")
@RestController
@RequestMapping("/api/rooms/{roomId}/meals/{mealSessionId}")
public class VoteController {

    private final VoteService voteService;

    public VoteController(VoteService voteService) {
        this.voteService = voteService;
    }

    @Operation(
            summary = "메뉴 투표하기",
            description = "메뉴에 좋아요 또는 싫어요를 남깁니다. "
                    + "이미 선택한 메뉴면 선택이 변경됩니다. 응답은 내 전체 선택 목록입니다."
    )
    @PostMapping("/votes")
    public List<MyVoteResponse> vote(
            @PathVariable Long roomId,
            @PathVariable Long mealSessionId,
            @Valid @RequestBody VoteRequest request
    ) {
        return voteService.vote(roomId, mealSessionId, request);
    }

    @Operation(
            summary = "내 투표 조회",
            description = "새로고침 후 선택 상태를 복원할 때 사용합니다."
    )
    @GetMapping("/votes/me")
    public List<MyVoteResponse> getMyVotes(
            @PathVariable Long roomId,
            @PathVariable Long mealSessionId,
            @Parameter(description = "참여 시 발급받은 토큰")
            @RequestParam String participantToken
    ) {
        return voteService.getMyVotes(roomId, mealSessionId, participantToken);
    }

    @Operation(
            summary = "투표 결과 조회",
            description = "전원 투표 전에도 호출할 수 있습니다. "
                    + "allVoted가 false면 E04(투표 미완료) 화면으로 안내해주세요."
    )
    @GetMapping("/votes/result")
    public VoteResultResponse getResult(
            @PathVariable Long roomId,
            @PathVariable Long mealSessionId
    ) {
        return voteService.getResult(roomId, mealSessionId);
    }

    @Operation(
            summary = "메뉴 확정하기",
            description = "최다 득표 메뉴를 최종 메뉴로 확정합니다. "
                    + "전원 투표가 완료되어야 하며, 1위가 동점이면 확정할 수 없습니다."
    )
    @PostMapping("/confirm")
    public MealSessionResponse confirm(
            @PathVariable Long roomId,
            @PathVariable Long mealSessionId,
            @Valid @RequestBody ConfirmRequest request
    ) {
        return voteService.confirm(roomId, mealSessionId, request);
    }
}
