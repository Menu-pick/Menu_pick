package com.menupick.backend.room.repository;

import com.menupick.backend.room.entity.Room;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RoomRepository extends JpaRepository<Room, Long> {

    // 코드로 참여하기 (코드는 항상 대문자로 저장/조회)
    Optional<Room> findByCode(String code);

    boolean existsByCode(String code);
}
