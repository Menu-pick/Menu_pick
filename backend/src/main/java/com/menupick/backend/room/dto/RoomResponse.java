package com.menupick.backend.room.dto;

import com.menupick.backend.menu.entity.MenuCategory;
import com.menupick.backend.room.entity.MealType;
import com.menupick.backend.room.entity.Room;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;

public record RoomResponse(

        @Schema(description = "방 ID", example = "1")
        Long roomId,

        @Schema(description = "참여 코드", example = "ST3N7")
        String code,

        @Schema(description = "방 이름", example = "덕성 멋사 뭐 먹지?")
        String name,

        @Schema(description = "식사 방식")
        MealType mealType,

        @Schema(description = "음식 카테고리", example = "[\"KOREAN\", \"CHINESE\"]")
        List<MenuCategory> categories,

        @Schema(description = "카카오 장소 ID", example = "21160745")
        String placeId,

        @Schema(description = "식사 장소명", example = "덕성여자대학교")
        String placeName,

        @Schema(description = "식사 장소 주소", example = "서울 도봉구 삼양로144길 33")
        String address,

        @Schema(description = "기준 위치 위도", example = "37.6516")
        Double latitude,

        @Schema(description = "기준 위치 경도", example = "127.0164")
        Double longitude,

        @Schema(description = "참여 인원 수", example = "4")
        long participantCount,

        @Schema(description = "방 생성 일시")
        LocalDateTime createdAt
) {
    public static RoomResponse from(Room room, long participantCount) {
        return new RoomResponse(
                room.getId(),
                room.getCode(),
                room.getName(),
                room.getMealType(),
                room.getCategories().stream()
                        .sorted(Comparator.comparingInt(Enum::ordinal))
                        .toList(),
                room.getPlaceId(),
                room.getPlaceName(),
                room.getAddress(),
                room.getLatitude(),
                room.getLongitude(),
                participantCount,
                room.getCreatedAt()
        );
    }
}
