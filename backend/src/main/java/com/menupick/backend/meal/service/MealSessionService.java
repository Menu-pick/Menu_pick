package com.menupick.backend.meal.service;

import com.menupick.backend.meal.dto.MealSessionResponse;
import com.menupick.backend.meal.entity.MealSession;
import com.menupick.backend.meal.entity.MealStatus;
import com.menupick.backend.meal.repository.MealSessionRepository;
import com.menupick.backend.menu.entity.Menu;
import com.menupick.backend.menu.repository.MenuRepository;
import com.menupick.backend.room.entity.Room;
import com.menupick.backend.room.service.RoomService;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.security.SecureRandom;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Service
public class MealSessionService {

    private static final int CANDIDATE_COUNT = 3;

    private final MealSessionRepository mealSessionRepository;
    private final MenuRepository menuRepository;
    private final RoomService roomService;
    private final SecureRandom random = new SecureRandom();

    public MealSessionService(
            MealSessionRepository mealSessionRepository,
            MenuRepository menuRepository,
            RoomService roomService
    ) {
        this.mealSessionRepository = mealSessionRepository;
        this.menuRepository = menuRepository;
        this.roomService = roomService;
    }

    /**
     * 메뉴 후보를 추첨해 식사 세션을 시작합니다.
     * 진행 중인 세션이 있으면 재추첨하지 않고 기존 후보를 그대로 반환합니다.
     * (참여자마다 다른 후보를 보면 투표가 성립하지 않기 때문)
     */
    @Transactional
    public MealSessionResponse draw(Long roomId) {
        Room room = roomService.getRoomOrThrow(roomId);

        MealSession current = findCurrent(roomId);

        if (current != null && current.getStatus() == MealStatus.VOTING) {
            return MealSessionResponse.from(current);
        }

        List<Menu> candidates = pickRandomMenus(room);

        MealSession session = mealSessionRepository.save(
                new MealSession(roomId, candidates)
        );

        return MealSessionResponse.from(session);
    }

    // 현재 진행 중인(또는 가장 최근) 식사 세션 조회
    @Transactional(readOnly = true)
    public MealSessionResponse getCurrent(Long roomId) {
        roomService.getRoomOrThrow(roomId);

        MealSession current = findCurrent(roomId);

        if (current == null) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "아직 메뉴 후보를 뽑지 않았어요."
            );
        }

        return MealSessionResponse.from(current);
    }

    private MealSession findCurrent(Long roomId) {
        return mealSessionRepository
                .findFirstByRoomIdOrderByCreatedAtDesc(roomId)
                .orElse(null);
    }

    // 방에서 선택한 카테고리 안에서 중복 없이 3개를 뽑는다.
    private List<Menu> pickRandomMenus(Room room) {
        List<Menu> pool = new ArrayList<>(
                menuRepository.findByCategoryIn(room.getCategories())
        );

        if (pool.size() < CANDIDATE_COUNT) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "선택한 카테고리에 추천할 메뉴가 부족해요."
            );
        }

        Collections.shuffle(pool, random);

        return pool.subList(0, CANDIDATE_COUNT);
    }
}
