
package com.menupick.backend.recommendation.client;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.server.ResponseStatusException;
import tools.jackson.databind.JsonNode;

import java.util.Optional;

@Component
public class KakaoMapClient {

    private final RestClient restClient;

    public KakaoMapClient(
            @Value("${kakao.rest-api-key}") String apiKey
    ) {
        this.restClient = RestClient.builder()
                .baseUrl("https://dapi.kakao.com")
                .defaultHeader(
                        "Authorization",
                        "KakaoAK " + apiKey
                )
                .build();
    }

    // 방 생성 시 식사 장소 검색
    public JsonNode searchPlaces(String query) {
        try {
            JsonNode response = restClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/v2/local/search/keyword.json")
                            .queryParam("query", query)
                            .queryParam("size", 15)
                            .build())
                    .retrieve()
                    .body(JsonNode.class);

            if (response == null) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_GATEWAY,
                        "카카오 API 응답이 비어 있습니다."
                );
            }

            return response;

        } catch (RestClientException e) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_GATEWAY,
                    "카카오 장소 검색에 실패했습니다.", e
            );
        }
    }

    // 확정 메뉴 기반 주변 음식점 검색
    public JsonNode searchRestaurants(
            String menu,
            double latitude,
            double longitude
    ) {
        try {
            JsonNode response = restClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/v2/local/search/keyword.json")
                            .queryParam("query", menu)
                            .queryParam("category_group_code", "FD6")
                            .queryParam("x", longitude)
                            .queryParam("y", latitude)
                            .queryParam("radius", 2000)
                            .queryParam("sort", "distance")
                            .queryParam("size", 15)
                            .build())
                    .retrieve()
                    .body(JsonNode.class);

            if (response == null) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_GATEWAY,
                        "식당 검색 응답이 비어 있습니다."
                );
            }

            return response;

        } catch (RestClientException e) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_GATEWAY,
                    "주변 식당 검색에 실패했습니다.", e
            );
        }
    }

    // 실제 도보 경로 조회
    public Optional<WalkRoute> getWalkingRoute(
            double startLatitude,
            double startLongitude,
            double endLatitude,
            double endLongitude
    ) {
        try {
            JsonNode response = restClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/v2/routing/walk")
                            .queryParam("start_x", startLongitude)
                            .queryParam("start_y", startLatitude)
                            .queryParam("end_x", endLongitude)
                            .queryParam("end_y", endLatitude)
                            .build())
                    .retrieve()
                    .body(JsonNode.class);

            if (response == null) {
                return Optional.empty();
            }

            if (!"OK".equals(
                    response.path("status").asText()
            )) {
                return Optional.empty();
            }

            JsonNode properties = response
                    .path("route")
                    .path("properties");

            JsonNode distanceNode =
                    properties.path("totalDistance");
            JsonNode timeNode =
                    properties.path("totalTime");

            if (!distanceNode.isNumber() ||
                    !timeNode.isNumber()) {
                return Optional.empty();
            }

            int distance = distanceNode.asInt();
            int seconds = timeNode.asInt();

            int minutes = (int) Math.ceil(
                    seconds / 60.0
            );

            return Optional.of(
                    new WalkRoute(distance, minutes)
            );

        } catch (RestClientException e) {
            return Optional.empty();
        }
    }

    public record WalkRoute(
            int distanceMeters,
            int walkingMinutes
    ) {
    }
}
