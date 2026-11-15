package com.menupick.backend.meal.repository;

import com.menupick.backend.meal.entity.MealSession;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface MealSessionRepository extends JpaRepository<MealSession, Long> {

    // 방의 가장 최근 식사 세션
    Optional<MealSession> findFirstByRoomIdOrderByCreatedAtDesc(Long roomId);

    List<MealSession> findByRoomIdOrderByCreatedAtDesc(Long roomId);
}
