package com.menupick.backend.meal.dto;

import com.menupick.backend.menu.entity.Menu;
import com.menupick.backend.menu.entity.MenuCategory;
import io.swagger.v3.oas.annotations.media.Schema;

public record MenuCandidateResponse(

        @Schema(description = "메뉴 ID")
        Long menuId,

        @Schema(description = "메뉴명", example = "쌀국수")
        String name,

        @Schema(description = "음식 카테고리")
        MenuCategory category,

        @Schema(description = "메뉴 이미지 경로", example = "/images/menus/maratang.jpg")
        String imageUrl
) {
    public static MenuCandidateResponse from(Menu menu) {
        return new MenuCandidateResponse(
                menu.getId(),
                menu.getName(),
                menu.getCategory(),
                menu.getImageUrl()
        );
    }
}
