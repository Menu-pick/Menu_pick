
package com.menupick.backend.recommendation.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.time.LocalDateTime;

public record RestaurantConfirmResponse(

        @Schema(description = "확정 기록 ID")
        Long id,

        @Schema(description = "방 ID")
        Long roomId,

        @Schema(description = "카카오 장소 ID")
        String placeId,

        @Schema(description = "확정 식당명")
        String name,

        @Schema(description = "식당 주소")
        String address,

        @Schema(description = "위도")
        Double latitude,

        @Schema(description = "경도")
        Double longitude,

        @Schema(description = "거리(m)")
        Integer distanceMeters,

        @Schema(description = "거리 유형")
        String distanceType,

        @Schema(description = "도보 시간(분)")
        Integer walkingMinutes,

        @Schema(description = "식당 확정 일시(한국 시간)")
        LocalDateTime confirmedAt
) {
}
