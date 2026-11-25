
package com.menupick.backend.recommendation.dto;

import io.swagger.v3.oas.annotations.media.Schema;

public record RestaurantResponse(

        @Schema(description = "카카오 장소 ID")
        String placeId,

        @Schema(description = "식당명")
        String name,

        @Schema(description = "식당 주소")
        String address,

        @Schema(description = "식당 위도")
        double latitude,

        @Schema(description = "식당 경도")
        double longitude,

        @Schema(description = "직선거리(m)")
        int straightDistanceMeters,

        @Schema(description = "표시할 거리(m)")
        int distanceMeters,

        @Schema(description = "거리 유형: WALKING 또는 STRAIGHT")
        String distanceType,

        @Schema(description = "예상 도보 시간(분), 경로 조회 실패 시 null")
        Integer walkingMinutes

) {
}
