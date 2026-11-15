package com.menupick.backend.room.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RoomJoinRequest(

        @NotBlank(message = "참여 코드를 입력해주세요.")
        @Size(min = 5, max = 5, message = "참여 코드는 5자리예요.")
        @Schema(description = "방 참여 코드 (대소문자 구분 없음)", example = "ST3N7")
        String code,

        @NotBlank(message = "닉네임을 입력해주세요.")
        @Size(max = 10, message = "닉네임은 10자 이내로 입력해주세요.")
        @Schema(description = "참여할 닉네임 (최대 10자)", example = "채희")
        String nickname
) {
}
