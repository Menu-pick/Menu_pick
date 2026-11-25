
package com.menupick.backend.history.dto;

import com.menupick.backend.recommendation.entity.ConfirmedRestaurant;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record RestaurantHistoryResponse(
        Long id,
        String placeId,
        String name,
        String address,
        Double latitude,
        Double longitude,
        Integer distanceMeters,
        String distanceType,
        Integer walkingMinutes,
        LocalDate confirmedDate,
        LocalDateTime confirmedAt
) {
    public static RestaurantHistoryResponse from(
            ConfirmedRestaurant restaurant
    ) {
        return new RestaurantHistoryResponse(
                restaurant.getId(),
                restaurant.getPlaceId(),
                restaurant.getName(),
                restaurant.getAddress(),
                restaurant.getLatitude(),
                restaurant.getLongitude(),
                restaurant.getDistanceMeters(),
                restaurant.getDistanceType(),
                restaurant.getWalkingMinutes(),
                restaurant.getConfirmedDate(),
                restaurant.getConfirmedAt()
        );
    }
}
