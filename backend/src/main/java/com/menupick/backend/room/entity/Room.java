package com.menupick.backend.room.entity;

import com.menupick.backend.menu.entity.MenuCategory;
import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Collection;
import java.util.LinkedHashSet;
import java.util.Set;

@Entity
@Table(name = "rooms")
public class Room {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 15)
    private String name;

    // 친구 초대용 코드 (예: B4P1K)
    @Column(nullable = false, length = 10, unique = true)
    private String code;

    // --- 식사 장소 (카카오 장소 검색 결과를 그대로 저장) ---

    @Column(name = "place_id", nullable = false, length = 100)
    private String placeId;

    @Column(name = "place_name", nullable = false, length = 255)
    private String placeName;

    @Column(nullable = false, length = 500)
    private String address;

    // 주변 식당 추천 시 기준 좌표로 사용
    @Column(nullable = false)
    private Double latitude;

    @Column(nullable = false)
    private Double longitude;

    @Enumerated(EnumType.STRING)
    @Column(name = "meal_type", nullable = false, length = 20)
    private MealType mealType;

    // 메뉴 후보 추첨 대상이 되는 카테고리 (복수 선택)
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(
            name = "room_categories",
            joinColumns = @JoinColumn(name = "room_id")
    )
    @Enumerated(EnumType.STRING)
    @Column(name = "category", nullable = false, length = 20)
    private Set<MenuCategory> categories = new LinkedHashSet<>();

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    protected Room() {
    }

    public Room(
            String name,
            String code,
            String placeId,
            String placeName,
            String address,
            Double latitude,
            Double longitude,
            MealType mealType,
            Collection<MenuCategory> categories
    ) {
        this.name = name;
        this.code = code;
        this.placeId = placeId;
        this.placeName = placeName;
        this.address = address;
        this.latitude = latitude;
        this.longitude = longitude;
        this.mealType = mealType;
        this.categories = new LinkedHashSet<>(categories);
    }

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now(ZoneId.of("Asia/Seoul"));
        }
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getCode() {
        return code;
    }

    public String getPlaceId() {
        return placeId;
    }

    public String getPlaceName() {
        return placeName;
    }

    public String getAddress() {
        return address;
    }

    public Double getLatitude() {
        return latitude;
    }

    public Double getLongitude() {
        return longitude;
    }

    public MealType getMealType() {
        return mealType;
    }

    public Set<MenuCategory> getCategories() {
        return categories;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
