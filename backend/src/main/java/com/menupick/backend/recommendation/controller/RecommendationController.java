
package com.menupick.backend.recommendation.controller;

import com.menupick.backend.recommendation.dto.LocationResponse;
import com.menupick.backend.recommendation.dto.RestaurantResponse;
import com.menupick.backend.recommendation.service.RecommendationService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Tag(name = "식당 추천")
@RestController
@RequestMapping("/api/recommendations")
public class RecommendationController {

    private final RecommendationService recommendationService;

    public RecommendationController(
            RecommendationService recommendationService
    ) {
        this.recommendationService = recommendationService;
    }

    @Operation(summary = "식사 장소 검색")
    @GetMapping("/locations")
    public List<LocationResponse> searchLocations(
            @Parameter(
                    description = "검색할 장소명",
                    example = "혜화역"
            )
            @RequestParam String query
    ) {
        if (query == null || query.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "검색어를 입력해주세요."
            );
        }

        return recommendationService.searchLocations(
                query.trim()
        );
    }

    @Operation(summary = "확정 메뉴 기반 주변 식당 추천")
    @GetMapping("/restaurants")
    public List<RestaurantResponse> recommendRestaurants(

            @Parameter(
                    description = "확정된 메뉴명",
                    example = "쌀국수"
            )
            @RequestParam String menu,

            @Parameter(
                    description = "방의 기준 위치 위도",
                    example = "37.5820439"
            )
            @RequestParam double latitude,

            @Parameter(
                    description = "방의 기준 위치 경도",
                    example = "127.0019450"
            )
            @RequestParam double longitude
    ) {
        if (menu == null || menu.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "메뉴명을 입력해주세요."
            );
        }

        if (!Double.isFinite(latitude) ||
                !Double.isFinite(longitude) ||
                latitude < -90 || latitude > 90 ||
                longitude < -180 || longitude > 180) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "올바른 위도와 경도를 입력해주세요."
            );
        }

        return recommendationService.recommendRestaurants(
                menu.trim(),
                latitude,
                longitude
        );
    }
}
