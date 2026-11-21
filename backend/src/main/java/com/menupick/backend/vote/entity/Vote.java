package com.menupick.backend.vote.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.time.ZoneId;

/**
 * 한 참여자가 한 메뉴 후보에 남긴 선호입니다.
 * (식사 세션, 참여자, 메뉴) 조합마다 하나만 존재합니다.
 */
@Entity
@Table(
        name = "votes",
        uniqueConstraints = @UniqueConstraint(
                name = "uk_session_participant_menu",
                columnNames = {"meal_session_id", "participant_id", "menu_id"}
        )
)
public class Vote {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "meal_session_id", nullable = false)
    private Long mealSessionId;

    @Column(name = "participant_id", nullable = false)
    private Long participantId;

    @Column(name = "menu_id", nullable = false)
    private Long menuId;

    @Enumerated(EnumType.STRING)
    @Column(name = "vote_type", nullable = false, length = 20)
    private VoteType voteType;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    protected Vote() {
    }

    public Vote(
            Long mealSessionId,
            Long participantId,
            Long menuId,
            VoteType voteType
    ) {
        this.mealSessionId = mealSessionId;
        this.participantId = participantId;
        this.menuId = menuId;
        this.voteType = voteType;
        this.updatedAt = now();
    }

    // 결과 확정 전에는 좋아요 ↔ 싫어요 변경이 가능하다. (명세서 27번)
    public void changeTo(VoteType voteType) {
        this.voteType = voteType;
        this.updatedAt = now();
    }

    private LocalDateTime now() {
        return LocalDateTime.now(ZoneId.of("Asia/Seoul"));
    }

    public Long getId() {
        return id;
    }

    public Long getMealSessionId() {
        return mealSessionId;
    }

    public Long getParticipantId() {
        return participantId;
    }

    public Long getMenuId() {
        return menuId;
    }

    public VoteType getVoteType() {
        return voteType;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}
