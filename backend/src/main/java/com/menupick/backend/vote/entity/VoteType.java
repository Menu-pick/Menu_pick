package com.menupick.backend.vote.entity;

public enum VoteType {

    LIKE("좋아요"),
    DISLIKE("싫어요");

    private final String displayName;

    VoteType(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
