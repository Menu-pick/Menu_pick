package com.menupick.backend.participant.service;

import com.menupick.backend.participant.entity.Participant;
import com.menupick.backend.participant.repository.ParticipantRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class ParticipantService {

    private static final int MAX_NICKNAME_ATTEMPTS = 50;

    private final ParticipantRepository participantRepository;

    public ParticipantService(ParticipantRepository participantRepository) {
        this.participantRepository = participantRepository;
    }

    /**
     * 방에 참여자를 등록합니다.
     * 닉네임을 입력하지 않으면 "참여자 N" 형태로 자동 생성합니다.
     */
    @Transactional
    public Participant join(Long roomId, String nickname) {
        String resolved = (nickname == null || nickname.isBlank())
                ? generateNickname(roomId)
                : nickname.trim();

        if (participantRepository.existsByRoomIdAndNickname(roomId, resolved)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "이미 사용 중인 닉네임이에요. 다른 닉네임을 입력해주세요."
            );
        }

        return participantRepository.save(new Participant(roomId, resolved));
    }

    private String generateNickname(Long roomId) {
        long count = participantRepository.countByRoomId(roomId);

        for (int i = 1; i <= MAX_NICKNAME_ATTEMPTS; i++) {
            String candidate = "참여자 " + (count + i);

            if (!participantRepository.existsByRoomIdAndNickname(roomId, candidate)) {
                return candidate;
            }
        }

        throw new ResponseStatusException(
                HttpStatus.INTERNAL_SERVER_ERROR,
                "닉네임을 생성하지 못했습니다. 닉네임을 직접 입력해주세요."
        );
    }
}
