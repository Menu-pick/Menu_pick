
package com.menupick.backend.history.service;

import com.menupick.backend.history.dto.RestaurantHistoryResponse;
import com.menupick.backend.recommendation.repository.ConfirmedRestaurantRepository;
import com.menupick.backend.room.service.RoomService;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.DateTimeException;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;

@Service
public class RestaurantHistoryService {

    private final ConfirmedRestaurantRepository repository;
    private final RoomService roomService;

    public RestaurantHistoryService(
            ConfirmedRestaurantRepository repository,
            RoomService roomService
    ) {
        this.repository = repository;
        this.roomService = roomService;
    }

    // 1. 월별 식당 기록 날짜 조회
    public List<LocalDate> getRecordedDates(
            Long roomId,
            int year,
            int month
    ) {

        // 실제 존재하는 방인지 검증
        roomService.getRoomOrThrow(roomId);

        YearMonth yearMonth;

        try {
            yearMonth = YearMonth.of(year, month);
        } catch (DateTimeException e) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "올바르지 않은 연도 또는 월입니다."
            );
        }

        LocalDate startDate = yearMonth.atDay(1);
        LocalDate endDate = yearMonth.atEndOfMonth();

        return repository
                .findByRoomIdAndConfirmedDateBetweenOrderByConfirmedDateAscConfirmedAtAsc(
                        roomId,
                        startDate,
                        endDate
                )
                .stream()
                .map(restaurant -> restaurant.getConfirmedDate())
                .distinct()
                .toList();
    }

    // 2. 선택 날짜의 확정 식당 기록 조회
    public List<RestaurantHistoryResponse> getRestaurantsByDate(
            Long roomId,
            LocalDate date
    ) {

        // 실제 존재하는 방인지 검증
        roomService.getRoomOrThrow(roomId);

        if (date == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "조회 날짜는 필수입니다."
            );
        }

        return repository
                .findByRoomIdAndConfirmedDateOrderByConfirmedAtAsc(
                        roomId,
                        date
                )
                .stream()
                .map(RestaurantHistoryResponse::from)
                .toList();
    }
}
