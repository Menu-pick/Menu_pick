package com.menupick.backend.meal.dto;

import com.menupick.backend.meal.entity.MealSession;
import com.menupick.backend.meal.entity.MealStatus;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public record MealSessionResponse(

        @Schema(description = "식사 세션 ID", example = "1")
        Long mealSessionId,

        @Schema(description = "방 ID", example = "1")
        Long roomId,

        @Schema(description = "진행 상태")
        MealStatus status,

        @Schema(description = "메뉴 후보 3개 (슬롯 추첨 결과)")
        List<MenuCandidateResponse> candidates,

        @Schema(description = "확정된 메뉴 (확정 전에는 null)")
        MenuCandidateResponse confirmedMenu,

        @Schema(description = "메뉴 확정 날짜 (확정 전에는 null)")
        LocalDate confirmedDate,

        @Schema(description = "세션 시작 일시")
        LocalDateTime createdAt
) {
    public static MealSessionResponse from(MealSession session) {
        return new MealSessionResponse(
                session.getId(),
                session.getRoomId(),
                session.getStatus(),
                session.getCandidates().stream()
                        .map(MenuCandidateResponse::from)
                        .toList(),
                session.getConfirmedMenu() == null
                        ? null
                        : MenuCandidateResponse.from(session.getConfirmedMenu()),
                session.getConfirmedDate(),
                session.getCreatedAt()
        );
    }
}
