
package com.menupick.backend.recommendation.controller;

import com.menupick.backend.recommendation.dto.RestaurantConfirmRequest;
import com.menupick.backend.recommendation.dto.RestaurantConfirmResponse;
import com.menupick.backend.recommendation.service.RestaurantConfirmService;
import com.menupick.backend.recommendation.service.RestaurantConfirmService.ConfirmResult;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Tag(name = "식당 추천")
@RestController
@RequestMapping("/api/rooms/{roomId}/restaurants")
public class RestaurantConfirmController {

    private final RestaurantConfirmService service;

    public RestaurantConfirmController(
            RestaurantConfirmService service
    ) {
        this.service = service;
    }

    @Operation(summary = "식당 최종 확정 및 기록 저장")
    @PostMapping
    public ResponseEntity<RestaurantConfirmResponse> confirmRestaurant(
            @PathVariable Long roomId,
            @Valid @RequestBody RestaurantConfirmRequest request
    ) {
        ConfirmResult result = service.confirm(roomId, request);

        HttpStatus status = result.created()
                ? HttpStatus.CREATED
                : HttpStatus.OK;

        return ResponseEntity
                .status(status)
                .body(result.response());
    }
}
