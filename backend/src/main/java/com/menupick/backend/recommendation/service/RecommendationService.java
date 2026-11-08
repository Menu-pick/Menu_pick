
package com.menupick.backend.recommendation.service;

import com.menupick.backend.recommendation.client.KakaoMapClient;
import com.menupick.backend.recommendation.client.KakaoMapClient.WalkRoute;
import com.menupick.backend.recommendation.dto.LocationResponse;
import com.menupick.backend.recommendation.dto.RestaurantResponse;

import org.springframework.stereotype.Service;
import tools.jackson.databind.JsonNode;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;

@Service
public class RecommendationService {

    private final KakaoMapClient kakaoMapClient;

    public RecommendationService(
            KakaoMapClient kakaoMapClient
    ) {
        this.kakaoMapClient = kakaoMapClient;
    }

    // 식사 장소 검색
    public List<LocationResponse> searchLocations(String query) {

        JsonNode response = kakaoMapClient.searchPlaces(query);
        List<LocationResponse> locations = new ArrayList<>();

        for (JsonNode place : response.path("documents")) {

            String address =
                    place.path("road_address_name").asText();

            if (address.isBlank()) {
                address = place.path("address_name").asText();
            }

            locations.add(new LocationResponse(
                    place.path("id").asText(),
                    place.path("place_name").asText(),
                    address,
                    place.path("y").asDouble(),
                    place.path("x").asDouble()
            ));
        }

        return locations;
    }

    // 주변 식당 추천
    public List<RestaurantResponse> recommendRestaurants(
            String menu,
            double latitude,
            double longitude
    ) {
        JsonNode response = kakaoMapClient.searchRestaurants(
                menu, latitude, longitude
        );

        List<RestaurantResponse> restaurants =
                new ArrayList<>();

        for (JsonNode place : response.path("documents")) {

            if (restaurants.size() >= 5) {
                break;
            }

            String name =
                    place.path("place_name").asText();

            String address =
                    place.path("road_address_name").asText();

            if (address.isBlank()) {
                address = place.path("address_name").asText();
            }

            double restaurantLatitude =
                    place.path("y").asDouble();

            double restaurantLongitude =
                    place.path("x").asDouble();

            int straightDistance =
                    place.path("distance").asInt();

            Optional<WalkRoute> walkingRoute =
                    kakaoMapClient.getWalkingRoute(
                            latitude,
                            longitude,
                            restaurantLatitude,
                            restaurantLongitude
                    );

            int distanceMeters = straightDistance;
            Integer walkingMinutes = null;
            String distanceType = "STRAIGHT";

            if (walkingRoute.isPresent()) {
                WalkRoute route = walkingRoute.get();

                distanceMeters = route.distanceMeters();
                walkingMinutes = route.walkingMinutes();
                distanceType = "WALKING";
            }

            restaurants.add(new RestaurantResponse(
                    place.path("id").asText(),
                    name,
                    address,
                    restaurantLatitude,
                    restaurantLongitude,
                    straightDistance,
                    distanceMeters,
                    distanceType,
                    walkingMinutes
            ));
        }

        // 실제 도보 경로가 있는 식당 우선,
        // 같은 유형 내에서는 거리순 정렬
        restaurants.sort(
                Comparator.comparing(
                        (RestaurantResponse r) ->
                                !"WALKING".equals(r.distanceType())
                ).thenComparingInt(
                        RestaurantResponse::distanceMeters
                )
        );

        return restaurants;
    }
}
