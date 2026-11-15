package com.menupick.backend.room.dto;

import com.menupick.backend.menu.entity.MenuCategory;
import com.menupick.backend.room.entity.MealType;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;

import java.util.Set;

public record RoomCreateRequest(

        @NotBlank(message = "방 이름을 입력해주세요.")
        @Size(max = 15, message = "방 이름은 15자 이내로 입력해주세요.")
        @Schema(description = "방 이름 (최대 15자)", example = "덕성 멋사 뭐 먹지?")
        String name,

        @NotNull(message = "식사 방식을 선택해주세요.")
        @Schema(description = "식사 방식", example = "DINE_IN")
        MealType mealType,

        @NotEmpty(message = "음식 카테고리를 하나 이상 선택해주세요.")
        @Schema(description = "음식 카테고리 (복수 선택)", example = "[\"KOREAN\", \"CHINESE\"]")
        Set<MenuCategory> categories,

        @NotBlank(message = "식사 장소를 선택해주세요.")
        @Schema(description = "카카오 장소 ID", example = "21160745")
        String placeId,

        @NotBlank(message = "식사 장소를 선택해주세요.")
        @Schema(description = "식사 장소명 (장소 검색 응답의 name)", example = "덕성여자대학교")
        String placeName,

        @NotBlank(message = "식사 장소를 선택해주세요.")
        @Schema(description = "식사 장소 주소", example = "서울 도봉구 삼양로144길 33")
        String address,

        @NotNull(message = "식사 장소를 선택해주세요.")
        @DecimalMin(value = "-90.0", message = "올바른 위도를 입력해주세요.")
        @DecimalMax(value = "90.0", message = "올바른 위도를 입력해주세요.")
        @Schema(description = "기준 위치 위도", example = "37.6516")
        Double latitude,

        @NotNull(message = "식사 장소를 선택해주세요.")
        @DecimalMin(value = "-180.0", message = "올바른 경도를 입력해주세요.")
        @DecimalMax(value = "180.0", message = "올바른 경도를 입력해주세요.")
        @Schema(description = "기준 위치 경도", example = "127.0164")
        Double longitude
) {
}
