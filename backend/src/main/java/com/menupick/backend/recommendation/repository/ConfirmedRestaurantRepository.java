
package com.menupick.backend.recommendation.repository;

import com.menupick.backend.recommendation.entity.ConfirmedRestaurant;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.Optional;

public interface ConfirmedRestaurantRepository
        extends JpaRepository<ConfirmedRestaurant, Long> {

    Optional<ConfirmedRestaurant> findByRoomIdAndPlaceIdAndConfirmedDate(
            Long roomId,
            String placeId,
            LocalDate confirmedDate
    );
}
