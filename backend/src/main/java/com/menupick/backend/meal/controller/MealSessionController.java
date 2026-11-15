package com.menupick.backend.meal.controller;

import com.menupick.backend.meal.dto.MealSessionResponse;
import com.menupick.backend.meal.service.MealSessionService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Tag(name = "식사 세션")
@RestController
@RequestMapping("/api/rooms/{roomId}/meals")
public class MealSessionController {

    private final MealSessionService mealSessionService;

    public MealSessionController(MealSessionService mealSessionService) {
        this.mealSessionService = mealSessionService;
    }

    @Operation(
            summary = "메뉴 후보 뽑기",
            description = "방의 음식 카테고리를 기준으로 메뉴 후보 3개를 추첨해 식사 세션을 시작합니다. "
                    + "이미 진행 중인 세션이 있으면 기존 후보를 그대로 반환합니다."
    )
    @PostMapping
    public ResponseEntity<MealSessionResponse> drawCandidates(
            @PathVariable Long roomId
    ) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(mealSessionService.draw(roomId));
    }

    @Operation(
            summary = "메뉴 후보 다시 뽑기",
            description = "후보가 마음에 들지 않거나 최다 득표가 동점일 때 후보 3개를 다시 추첨합니다. "
                    + "기존 투표는 모두 초기화되며, 직전 후보는 제외하고 뽑습니다."
    )
    @PostMapping("/{mealSessionId}/redraw")
    public MealSessionResponse redrawCandidates(
            @PathVariable Long roomId,
            @PathVariable Long mealSessionId
    ) {
        return mealSessionService.redraw(roomId, mealSessionId);
    }

    @Operation(
            summary = "현재 식사 세션 조회",
            description = "늦게 입장하거나 새로고침한 참여자도 동일한 메뉴 후보를 보기 위해 사용합니다."
    )
    @GetMapping("/current")
    public MealSessionResponse getCurrentSession(@PathVariable Long roomId) {
        return mealSessionService.getCurrent(roomId);
    }
}
