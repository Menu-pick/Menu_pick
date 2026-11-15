package com.menupick.backend.participant.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.UUID;

@Entity
@Table(
        name = "participants",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_room_nickname",
                        columnNames = {"room_id", "nickname"}
                ),
                @UniqueConstraint(
                        name = "uk_participant_token",
                        columnNames = {"token"}
                )
        }
)
public class Participant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "room_id", nullable = false)
    private Long roomId;

    @Column(nullable = false, length = 10)
    private String nickname;

    // 로그인이 없으므로 본인 확인용 토큰을 발급한다.
    // 참여 시 본인에게만 1회 반환하며, 참여자 목록 조회에는 포함하지 않는다.
    @Column(nullable = false, length = 36)
    private String token;

    @Column(name = "joined_at", nullable = false, updatable = false)
    private LocalDateTime joinedAt;

    protected Participant() {
    }

    public Participant(Long roomId, String nickname) {
        this.roomId = roomId;
        this.nickname = nickname;
        this.token = UUID.randomUUID().toString();
    }

    public void changeNickname(String nickname) {
        this.nickname = nickname;
    }

    @PrePersist
    protected void onCreate() {
        if (joinedAt == null) {
            joinedAt = LocalDateTime.now(ZoneId.of("Asia/Seoul"));
        }
    }

    public Long getId() {
        return id;
    }

    public Long getRoomId() {
        return roomId;
    }

    public String getNickname() {
        return nickname;
    }

    public String getToken() {
        return token;
    }

    public LocalDateTime getJoinedAt() {
        return joinedAt;
    }
}
