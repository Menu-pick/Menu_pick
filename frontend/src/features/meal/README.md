# 담당 화면 기능 연결

백엔드 요청 없이 Zustand와 localStorage(`bappick-meal-demo`, version 2)로 식사 세션을 저장합니다. 방 생성·설정·대기실과 공통 라우터는 수정하지 않았습니다.

## 방 화면에서 연결할 함수

```ts
import { useMealStore } from './mealStore'

const store = useMealStore.getState()
store.configureRoom(roomId, {
  name: '우리 방',
  categories: ['면류'],
  mode: 'restaurant', // 또는 'delivery'
  location: '덕성여대 근처',
}, members) // members: { id, name, image }[]
store.startMeal(roomId, true) // 기존 멤버·옵션을 사용해 새 식사 시작
// 이후 /room/:roomId/roulette 로 이동
```

- `startMeal(roomId)`는 진행 중인 후보·투표를 유지합니다. 완료된 세션에서는 새 식사를 시작합니다.
- `startMeal(roomId, true)`는 명시적으로 새 세션을 만듭니다. 과거 기록은 삭제하지 않습니다.
- `setCurrentParticipant(roomId, memberId)`로 로컬 참여자를 바꿀 수 있습니다. 실제 로그인/실시간 동기화는 아직 연결하지 않았습니다.
- `setCatalog(menuCatalog, restaurantCatalog)`로 프론트용 데이터를 제공할 수 있습니다. 추첨은 선택한 카테고리 안에서 ID가 다른 후보 3개를 저장합니다. 후보가 부족하면 `false`를 반환합니다.

## 예시 데이터와 한계

- 기본 예시 메뉴는 쌀국수·마라탕·칼국수입니다. 한식 등 좁은 카테고리만 선택하면 3개가 되지 않을 수 있으므로, 실제 방 연결 시 충분한 메뉴 데이터를 제공해야 합니다. 조건 밖 메뉴로 임의 대체하지 않습니다.
- 기본 예시 방에는 현재 사용자 외 3명의 예시 투표가 있습니다. `configureRoom`에 실제 멤버를 전달하면 이 예시 투표를 사용하지 않습니다.
- 기본 예시 식당은 덕성여대 근처 쌀국수 식당 3곳입니다. 메뉴·위치가 다르면 추천하지 않습니다. 지도 링크는 식당명과 지역 검색을 사용하며, 실제 장소 ID/좌표 연동은 추후 필요합니다.
- 모든 멤버의 선택이 완료되고 1위가 하나일 때만 확정할 수 있습니다. 동률 결선 UI, 식당 대표 메뉴·가격, 예외 화면은 별도 담당/디자인 합의 전까지 구현하지 않습니다.
- 배달은 최신 Figma대로 외부 사이트를 열고 직접 주문하는 방식입니다. 검색 딥링크·결제는 연결하지 않습니다.
- 완료 기록은 세션당 한 번 저장되며 공유는 그 기록을 읽습니다. 새 식사를 시작해도 과거 공유 내용이 바뀌지 않습니다. 기록 링크 열람은 같은 브라우저의 로컬 데이터 범위입니다.
- 달력은 방별 날짜 기록을 읽고 브라우저 뒤로가기에도 선택 날짜가 동기화됩니다. 기록 날짜는 접근성 설명에 표시하며, 디자인에 없는 시각적 날짜 마커는 추가하지 않았습니다.
