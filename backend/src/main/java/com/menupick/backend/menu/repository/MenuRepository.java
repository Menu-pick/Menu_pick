package com.menupick.backend.menu.repository;

import com.menupick.backend.menu.entity.Menu;
import com.menupick.backend.menu.entity.MenuCategory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;

public interface MenuRepository extends JpaRepository<Menu, Long> {

    // 방에서 선택한 카테고리의 메뉴 전체 조회 (추첨 대상)
    List<Menu> findByCategoryIn(Collection<MenuCategory> categories);

    long countByCategoryIn(Collection<MenuCategory> categories);
}
