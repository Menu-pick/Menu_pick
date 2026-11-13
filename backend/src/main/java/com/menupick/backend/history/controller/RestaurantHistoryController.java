
package com.menupick.backend.history.controller;

import com.menupick.backend.history.dto.RestaurantHistoryResponse;
import com.menupick.backend.history.service.RestaurantHistoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/rooms/{roomId}/restaurants")
@Tag(name = "식사 기록")
public class RestaurantHistoryController {

    private final RestaurantHistoryService historyService;

    public RestaurantHistoryController(
            RestaurantHistoryService historyService
    ) {
        this.historyService = historyService;
    }

    @GetMapping("/dates")
    @Operation(summary = "월별 식당 기록 날짜 조회")
    public List<LocalDate> getRecordedDates(
            @PathVariable Long roomId,
            @RequestParam int year,
            @RequestParam int month
    ) {
        return historyService.getRecordedDates(
                roomId,
                year,
                month
        );
    }

    @GetMapping
    @Operation(summary = "날짜별 확정 식당 조회")
    public List<RestaurantHistoryResponse> getRestaurantsByDate(
            @PathVariable Long roomId,
            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate date
    ) {
        return historyService.getRestaurantsByDate(
                roomId,
                date
        );
    }
}
