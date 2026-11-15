package com.menupick.backend.menu.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "menus")
public class Menu {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 확정 후 카카오 지도 식당 검색어로도 사용되므로 일반적인 메뉴명을 사용
    @Column(nullable = false, length = 50, unique = true)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private MenuCategory category;

    @Column(name = "image_url", length = 500)
    private String imageUrl;

    protected Menu() {
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public MenuCategory getCategory() {
        return category;
    }

    public String getImageUrl() {
        return imageUrl;
    }
}
