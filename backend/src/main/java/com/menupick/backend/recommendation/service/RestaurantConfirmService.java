
package com.menupick.backend.recommendation.service;

import com.menupick.backend.recommendation.dto.RestaurantConfirmRequest;
import com.menupick.backend.recommendation.dto.RestaurantConfirmResponse;
import com.menupick.backend.recommendation.entity.ConfirmedRestaurant;
import com.menupick.backend.recommendation.repository.ConfirmedRestaurantRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.ZoneId;

@Service
public class RestaurantConfirmService {

    private final ConfirmedRestaurantRepository repository;

    public RestaurantConfirmService(
            ConfirmedRestaurantRepository repository
    ) {
        this.repository = repository;
    }

    public record ConfirmResult(
            RestaurantConfirmResponse response,
            boolean created
    ) {}

    @Transactional
    public ConfirmResult confirm(
            Long roomId,
            RestaurantConfirmRequest request
    ) {
        if (roomId == null || roomId <= 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "올바른 방 ID를 입력해주세요."
            );
        }

        if ("WALKING".equals(request.distanceType())
                && request.walkingMinutes() == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "도보 거리에는 도보 시간이 필요합니다."
            );
        }

        if ("STRAIGHT".equals(request.distanceType())
                && request.walkingMinutes() != null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "직선거리에는 도보 시간을 입력할 수 없습니다."
            );
        }

        LocalDate today = LocalDate.now(
                ZoneId.of("Asia/Seoul")
        );

        // 오늘 같은 방에서 같은 식당을 확정했는지 조회
        var existing = repository
                .findByRoomIdAndPlaceIdAndConfirmedDate(
                        roomId,
                        request.placeId(),
                        today
                );

        // 이미 기록이 있다면 추가 저장 없이 정상 반환
        if (existing.isPresent()) {
            return new ConfirmResult(
                    toResponse(existing.get()),
                    false
            );
        }

        // 처음 확정한 식당이면 새 기록 저장
        ConfirmedRestaurant restaurant =
                new ConfirmedRestaurant(roomId, request);

        ConfirmedRestaurant saved =
                repository.saveAndFlush(restaurant);

        return new ConfirmResult(
                toResponse(saved),
                true
        );
    }

    private RestaurantConfirmResponse toResponse(
            ConfirmedRestaurant restaurant
    ) {
        return new RestaurantConfirmResponse(
                restaurant.getId(),
                restaurant.getRoomId(),
                restaurant.getPlaceId(),
                restaurant.getName(),
                restaurant.getAddress(),
                restaurant.getLatitude(),
                restaurant.getLongitude(),
                restaurant.getDistanceMeters(),
                restaurant.getDistanceType(),
                restaurant.getWalkingMinutes(),
                restaurant.getConfirmedAt()
        );
    }
}
