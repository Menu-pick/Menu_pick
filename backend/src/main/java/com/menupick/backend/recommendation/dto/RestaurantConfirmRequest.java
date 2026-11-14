
package com.menupick.backend.recommendation.dto;

import jakarta.validation.constraints.*;
import io.swagger.v3.oas.annotations.media.Schema;

public record RestaurantConfirmRequest(

        @NotBlank
        @Schema(description = "카카오 장소 ID")
        String placeId,

        @NotBlank
        @Schema(description = "식당명")
        String name,

        @NotBlank
        @Schema(description = "식당 주소")
        String address,

        @NotNull
        @DecimalMin("-90.0")
        @DecimalMax("90.0")
        @Schema(description = "위도")
        Double latitude,

        @NotNull
        @DecimalMin("-180.0")
        @DecimalMax("180.0")
        @Schema(description = "경도")
        Double longitude,

        @NotNull
        @PositiveOrZero
        @Schema(description = "표시할 거리(m)")
        Integer distanceMeters,

        @NotBlank
        @Pattern(regexp = "WALKING|STRAIGHT")
        @Schema(description = "거리 유형: WALKING 또는 STRAIGHT")
        String distanceType,

        @Positive
        @Schema(description = "도보 시간(분), 조회 실패 시 null")
        Integer walkingMinutes
) {
}
