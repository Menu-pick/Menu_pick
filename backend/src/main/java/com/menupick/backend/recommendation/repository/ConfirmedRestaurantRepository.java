
package com.menupick.backend.recommendation.repository;

import com.menupick.backend.recommendation.entity.ConfirmedRestaurant;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface ConfirmedRestaurantRepository
        extends JpaRepository<ConfirmedRestaurant, Long> {

    //  같은 날짜, 같은 식당 중복 저장 방지
    Optional<ConfirmedRestaurant> findByRoomIdAndPlaceIdAndConfirmedDate(
            Long roomId,
            String placeId,
            LocalDate confirmedDate
    );

    // 해당 월에 기록된 식당 조회
    List<ConfirmedRestaurant>
    findByRoomIdAndConfirmedDateBetweenOrderByConfirmedDateAscConfirmedAtAsc(
            Long roomId,
            LocalDate startDate,
            LocalDate endDate
    );

    // 선택 날짜의 확정 식당 조회
    List<ConfirmedRestaurant>
    findByRoomIdAndConfirmedDateOrderByConfirmedAtAsc(
            Long roomId,
            LocalDate confirmedDate
    );
}
