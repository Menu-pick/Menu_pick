
package com.menupick.backend.recommendation.service;

import com.menupick.backend.recommendation.dto.RestaurantConfirmRequest;
import com.menupick.backend.recommendation.dto.RestaurantConfirmResponse;
import com.menupick.backend.recommendation.entity.ConfirmedRestaurant;
import com.menupick.backend.recommendation.repository.ConfirmedRestaurantRepository;
import com.menupick.backend.room.entity.MealType;
import com.menupick.backend.room.entity.Room;
import com.menupick.backend.room.service.RoomService;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.ZoneId;

@Service
public class RestaurantConfirmService {

    private final ConfirmedRestaurantRepository repository;
    private final RoomService roomService;

    public RestaurantConfirmService(
            ConfirmedRestaurantRepository repository,
            RoomService roomService
    ) {
        this.repository = repository;
        this.roomService = roomService;
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

        // 1. 실제 존재하는 방인지 검증
        // 존재하지 않는 방이면 404 반환
        Room room = roomService.getRoomOrThrow(roomId);

        // 2. 식사 방식 검증
        // 매장 식사인 경우에만 식당 확정 가능
        if (room.getMealType() != MealType.DINE_IN) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "매장 식사인 경우에만 식당을 확정할 수 있습니다."
            );
        }

        // 3. 거리 정보 검증
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

        // 4. 한국 시간 기준 확정 날짜
        LocalDate today = LocalDate.now(
                ZoneId.of("Asia/Seoul")
        );

        // 5. 같은 방, 같은 날짜, 같은 식당 중복 확인
        var existing = repository
                .findByRoomIdAndPlaceIdAndConfirmedDate(
                        roomId,
                        request.placeId(),
                        today
                );

        // 이미 확정한 식당이라면 새 기록을 만들지 않음
        if (existing.isPresent()) {
            return new ConfirmResult(
                    toResponse(existing.get()),
                    false
            );
        }

        // 6. 새로운 식당 확정 기록 저장
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
