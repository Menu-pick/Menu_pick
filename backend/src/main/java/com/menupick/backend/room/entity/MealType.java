package com.menupick.backend.room.entity;

public enum MealType {

    DINE_IN("매장"),
    DELIVERY("배달");

    private final String displayName;

    MealType(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
