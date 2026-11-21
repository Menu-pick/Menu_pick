package com.menupick.backend.global.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Map;

public record ErrorResponse(

        @Schema(description = "HTTP 상태 코드", example = "400")
        int status,

        @Schema(description = "사용자에게 보여줄 메시지", example = "방 이름은 15자 이내로 입력해주세요.")
        String message,

        @Schema(description = "필드별 오류 (검증 실패 시에만 채워짐)")
        Map<String, String> errors,

        @Schema(description = "발생 시각")
        LocalDateTime timestamp
) {
    public static ErrorResponse of(int status, String message) {
        return of(status, message, Map.of());
    }

    public static ErrorResponse of(
            int status,
            String message,
            Map<String, String> errors
    ) {
        return new ErrorResponse(
                status,
                message,
                errors,
                LocalDateTime.now(ZoneId.of("Asia/Seoul"))
        );
    }
}
