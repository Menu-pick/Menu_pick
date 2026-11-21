package com.menupick.backend.room.service;

import com.menupick.backend.room.repository.RoomRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

import java.security.SecureRandom;

@Component
public class RoomCodeGenerator {

    // 사람이 직접 입력하는 코드이므로 혼동하기 쉬운 문자(I, L, O, 0, 1)는 제외
    private static final String ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
    private static final int CODE_LENGTH = 5;
    private static final int MAX_ATTEMPTS = 10;

    private final RoomRepository roomRepository;
    private final SecureRandom random = new SecureRandom();

    public RoomCodeGenerator(RoomRepository roomRepository) {
        this.roomRepository = roomRepository;
    }

    public String generate() {
        for (int attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
            String code = randomCode();

            if (!roomRepository.existsByCode(code)) {
                return code;
            }
        }

        throw new ResponseStatusException(
                HttpStatus.INTERNAL_SERVER_ERROR,
                "방 코드를 생성하지 못했습니다. 잠시 후 다시 시도해주세요."
        );
    }

    private String randomCode() {
        StringBuilder sb = new StringBuilder(CODE_LENGTH);

        for (int i = 0; i < CODE_LENGTH; i++) {
            sb.append(ALPHABET.charAt(random.nextInt(ALPHABET.length())));
        }

        return sb.toString();
    }
}
