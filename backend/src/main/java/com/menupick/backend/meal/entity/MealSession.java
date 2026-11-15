package com.menupick.backend.meal.entity;

import com.menupick.backend.menu.entity.Menu;
import jakarta.persistence.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

/**
 * 한 방에서 한 번의 식사를 정하는 단위입니다.
 * 같은 방에서 "새로운 식사 선택하기"를 하면 세션이 하나 더 생깁니다.
 */
@Entity
@Table(name = "meal_sessions")
public class MealSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "room_id", nullable = false)
    private Long roomId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private MealStatus status;

    // 슬롯 추첨으로 선정된 메뉴 후보 (투표 대상)
    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
            name = "meal_session_candidates",
            joinColumns = @JoinColumn(name = "meal_session_id"),
            inverseJoinColumns = @JoinColumn(name = "menu_id")
    )
    @OrderColumn(name = "candidate_order")
    private List<Menu> candidates = new ArrayList<>();

    // 투표로 확정된 메뉴 (확정 전에는 null)
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "confirmed_menu_id")
    private Menu confirmedMenu;

    @Column(name = "confirmed_date")
    private LocalDate confirmedDate;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    protected MealSession() {
    }

    public MealSession(Long roomId, Collection<Menu> candidates) {
        this.roomId = roomId;
        this.status = MealStatus.VOTING;
        this.candidates = new ArrayList<>(candidates);
    }

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now(ZoneId.of("Asia/Seoul"));
        }
    }

    // 투표 결과로 메뉴를 확정합니다. (식사 기록의 기준이 됩니다)
    public void confirm(Menu menu) {
        this.confirmedMenu = menu;
        this.confirmedDate = LocalDate.now(ZoneId.of("Asia/Seoul"));
        this.status = MealStatus.CONFIRMED;
    }

    public Long getId() {
        return id;
    }

    public Long getRoomId() {
        return roomId;
    }

    public MealStatus getStatus() {
        return status;
    }

    public List<Menu> getCandidates() {
        return candidates;
    }

    public Menu getConfirmedMenu() {
        return confirmedMenu;
    }

    public LocalDate getConfirmedDate() {
        return confirmedDate;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
