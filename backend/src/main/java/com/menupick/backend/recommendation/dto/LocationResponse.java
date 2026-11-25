
package com.menupick.backend.recommendation.dto;

public record LocationResponse(
        String placeId,
        String name,
        String address,
        double latitude,
        double longitude
) {
}
