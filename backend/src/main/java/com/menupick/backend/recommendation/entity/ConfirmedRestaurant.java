
package com.menupick.backend.recommendation.entity;

import com.menupick.backend.recommendation.dto.RestaurantConfirmRequest;
import jakarta.persistence.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;

@Entity
@Table(
        name = "confirmed_restaurants",
        uniqueConstraints = @UniqueConstraint(
                name = "uk_room_place_date",
                columnNames = {
                        "room_id",
                        "place_id",
                        "confirmed_date"
                }
        )
)
public class ConfirmedRestaurant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "room_id", nullable = false)
    private Long roomId;

    @Column(name = "place_id", nullable = false, length = 100)
    private String placeId;

    @Column(nullable = false, length = 255)
    private String name;

    @Column(nullable = false, length = 500)
    private String address;

    @Column(nullable = false)
    private Double latitude;

    @Column(nullable = false)
    private Double longitude;

    @Column(name = "distance_meters", nullable = false)
    private Integer distanceMeters;

    @Column(name = "distance_type", nullable = false, length = 20)
    private String distanceType;

    @Column(name = "walking_minutes")
    private Integer walkingMinutes;

    @Column(name = "confirmed_at", nullable = false, updatable = false)
    private LocalDateTime confirmedAt;

    @Column(name = "confirmed_date", nullable = false, updatable = false)
    private LocalDate confirmedDate;

    protected ConfirmedRestaurant() {
    }

    public ConfirmedRestaurant(
            Long roomId,
            RestaurantConfirmRequest request
    ) {
        this.roomId = roomId;
        this.placeId = request.placeId();
        this.name = request.name();
        this.address = request.address();
        this.latitude = request.latitude();
        this.longitude = request.longitude();
        this.distanceMeters = request.distanceMeters();
        this.distanceType = request.distanceType();
        this.walkingMinutes = request.walkingMinutes();
    }

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now(
                ZoneId.of("Asia/Seoul")
        );

        if (confirmedAt == null) {
            confirmedAt = now;
        }

        if (confirmedDate == null) {
            confirmedDate = now.toLocalDate();
        }
    }

    public Long getId() {
        return id;
    }

    public Long getRoomId() {
        return roomId;
    }

    public String getPlaceId() {
        return placeId;
    }

    public String getName() {
        return name;
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

    public Integer getDistanceMeters() {
        return distanceMeters;
    }

    public String getDistanceType() {
        return distanceType;
    }

    public Integer getWalkingMinutes() {
        return walkingMinutes;
    }

    public LocalDateTime getConfirmedAt() {
        return confirmedAt;
    }

    public LocalDate getConfirmedDate() {
        return confirmedDate;
    }
}
