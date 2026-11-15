package com.menupick.backend.menu.entity;

public enum MenuCategory {

    KOREAN("한식"),
    CHINESE("중식"),
    JAPANESE("일식"),
    CAFE_DESSERT("카페·디저트"),
    FAST_FOOD("패스트푸드"),
    BUNSIK("분식");

    private final String displayName;

    MenuCategory(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
