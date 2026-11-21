# 식사 선택 화면 API 연동

## 실행

```bash
cd frontend
cp .env.example .env.local
npm ci
npm run dev
```

`VITE_API_BASE_URL`에 백엔드 서버 주소를 지정합니다. 미설정 시 `http://localhost:8080`을 사용합니다. 백엔드 실행에 필요한 DB와 Kakao 키는 백엔드 담당 설정을 사용합니다.

## 방 화면 담당자 연결 지점

방 생성/참여 API 응답을 받은 직후 아래 함수를 호출하고 **서버에서 발급한 숫자 roomId**로 이동합니다. 토큰을 URL이나 라우터 state에 넣지 않습니다.

```tsx
import apiClient from '../../api/apiClient'
import { registerMealAccess, type ApiJoinResponse } from '../../features/meal/mealApi'

// 방 생성/참여 화면에서 이미 받은 응답을 전달합니다.
const { data } = await apiClient.post<ApiJoinResponse>('/api/rooms/join', {
  code: invitationCode,
  nickname,
})
registerMealAccess(data)
navigate(`/room/${data.room.roomId}/waiting`)
// 대기실의 시작 버튼 → /room/${data.room.roomId}/roulette
```

- `registerMealAccess`는 응답의 `me.participantId`, `me.participantToken`, `me.nickname`을 방별로 보관합니다.
- 방 생성·참여·설정 폼의 기존 UI와 API 전환은 다른 담당자 영역이라 변경하지 않았습니다. 현재 로컬 생성 폼이 만든 UUID 방은 계속 데모입니다.
- 숫자 방 경로는 `RoomBoundary`에서 실제 방과 참여자 목록을 조회합니다. 같은 ID의 과거 로컬 예시 데이터는 서버 데이터로 교체합니다.
- 숫자 방의 `beginMeal`은 로컬 후보를 만들지 않습니다. 슬롯 화면 진입 시 서버가 후보를 생성합니다.
- `/room/demo/...`는 백엔드 없이 디자인을 확인하는 기존 데모입니다.
- 데모 슬롯은 `previewMenus.ts`에 반영한 백엔드 기본 메뉴 36종과 같은 로컬 사진을 사용합니다. 슬롯 재진입·새로고침 시 3개를 다시 뽑고, 가능한 경우 직전 후보는 제외합니다. 실제 숫자 방은 이 목록을 사용하지 않고 서버 후보를 유지합니다.

## API 흐름

| 화면 | 요청 |
| --- | --- |
| 06 슬롯 | `POST /api/rooms/:roomId/meals` |
| 새로고침/현재 후보 | `GET /api/rooms/:roomId/meals/current` |
| 동점 재추첨 | `POST /api/rooms/:roomId/meals/:sessionId/redraw` |
| 07 내 투표 복원 | `GET .../:sessionId/votes/me?participantToken=...` |
| 07 선택/선택 변경 | `POST .../:sessionId/votes` (`participantToken`, 숫자 `menuId`, `LIKE`/`DISLIKE`) |
| 08 집계/동점 | `GET .../:sessionId/votes/result` |
| 09 식당 추천 | `GET /api/recommendations/restaurants?menu=...&latitude=...&longitude=...` |
| 09/09-D 메뉴 확정 | `POST .../:sessionId/confirm` (`participantToken`) |
| 09 식당 확정·기록 | `POST /api/rooms/:roomId/restaurants` |
| 13 기록 날짜 | `GET /api/rooms/:roomId/restaurants/dates?year=...&month=...` |
| 14 날짜별 기록 | `GET /api/rooms/:roomId/restaurants?date=YYYY-MM-DD` |

- 후보는 서버 응답만 사용합니다. `menuId/name/category/imageUrl`을 화면 데이터로 변환하고, 백엔드가 추가한 `public/images/menus/*.jpg` 36장을 `imageUrl` 경로 그대로 표시합니다. 별도 메뉴 목록 API가 없어 프론트가 임의 후보를 서버에 전달하지 않습니다.
- 슬롯은 이미지를 불러온 뒤 1.5초 동안 회전합니다.
- 실제 방에서는 서버의 `allVoted`, `likeCount`, `totalCount`, `tie`로 화면과 이동을 결정합니다. 투표 중에는 3초 간격으로 현재 세션·참여자·집계를 갱신합니다. 변경 요청 중에는 폴링을 중단하고 중복 클릭을 막습니다.
- 참여자 이름은 `/api/rooms/:roomId/participants`의 `nickname`을 사용합니다. 매장·배달·동점 결과에 공통 적용하며, 5명 이상이면 Figma의 108×4px 스크롤바와 가로 넘기기를 표시합니다. 긴 닉네임은 말줄임하고 전체 이름을 툴팁으로 제공합니다.
- 재추첨은 서버의 redraw API를 사용하므로 후보 교체와 투표 초기화가 서버에 반영됩니다.
- 식당 정보는 기준 좌표와 최다 득표 메뉴로 조회합니다. 거리 유형을 구분하고, 실제 도보 시간이 없는 경우 직선거리로 표시합니다. 식당명·주소로 네이버 지도를 엽니다.
- 매장은 메뉴 확정 후 식당 기록 저장까지 성공해야 완료 화면으로 이동합니다. 배달은 메뉴 확정 성공 후 이동하며 앱 링크와 디자인은 유지합니다.
- API 실패를 로컬 예시 목록이나 성공 화면으로 대체하지 않습니다. E02(참여 토큰), E04(투표 부족), E05(식당 없음), E06(네트워크/서버 실패)로 연결합니다. 그 밖의 검증 실패는 서버 안내문을 표시합니다.

## 현재 백엔드 응답의 제한

- 식당 기록 DTO에는 메뉴·식사 세션 ID가 없습니다. 같은 브라우저에서 저장한 메뉴명은 식당 기록 ID로 결합하며, 다른 기기에서는 서버가 반환한 식당명·주소를 표시합니다.
- 배달 메뉴 확정 API는 있지만 배달 기록의 날짜별 조회 API는 없습니다. 배달 완료 요약은 현재 브라우저에 보관되며 서버 달력 API에는 매장 식당 기록만 존재합니다.
- 과거 식사 세션을 ID로 조회하는 API가 없어, 다른 기기에서 오래된 완료 링크의 메뉴·식당 요약을 완전히 복원할 수는 없습니다. 공유 문구에는 확정 결과를 포함합니다.
- 완료 화면의 클라이언트 요약 캐시는 서버 저장을 대체하지 않습니다. 서버에서 이미 확정된 세션의 중복 확정은 백엔드의 기존 멱등 처리를 따릅니다.

## 변경 범위

백엔드 파일은 수정하지 않습니다. 다른 담당자의 화면 디자인도 유지합니다. 공유 진입점인 `RoomBoundary`, 숫자 방의 `beginMeal`, API 클라이언트만 식사 화면 연결에 필요한 범위에서 수정했습니다.
