package com.menupick.backend.vote.repository;

import com.menupick.backend.vote.entity.Vote;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface VoteRepository extends JpaRepository<Vote, Long> {

    List<Vote> findByMealSessionId(Long mealSessionId);

    List<Vote> findByMealSessionIdAndParticipantId(
            Long mealSessionId,
            Long participantId
    );

    // 재추첨 시 기존 투표를 초기화한다.
    void deleteByMealSessionId(Long mealSessionId);

    Optional<Vote> findByMealSessionIdAndParticipantIdAndMenuId(
            Long mealSessionId,
            Long participantId,
            Long menuId
    );
}
