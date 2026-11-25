package com.menupick.backend.meal.entity;

public enum MealStatus {

    VOTING("투표 중"),
    CONFIRMED("메뉴 확정");

    private final String displayName;

    MealStatus(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
