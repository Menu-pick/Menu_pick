package com.menupick.backend.participant.repository;

import com.menupick.backend.participant.entity.Participant;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface ParticipantRepository extends JpaRepository<Participant, Long> {

    List<Participant> findByRoomIdOrderByJoinedAtAsc(Long roomId);

    boolean existsByRoomIdAndNickname(Long roomId, String nickname);

    long countByRoomId(Long roomId);

    // 투표 등에서 본인 확인 시 사용
    Optional<Participant> findByToken(String token);

    List<Participant> findByRoomIdIn(Collection<Long> roomIds);
}
