import BottomSheet, { type BottomSheetProps } from '../../features/meal/MealBottomSheet'
import { MealButton, useMealRoom } from '../../features/meal/MealUI'
import { restaurants, useMealStore, useRoomMeal } from '../../features/meal/mealStore'
import { useNavigate } from 'react-router'

type RestaurantBottomSheetProps = Omit<BottomSheetProps, 'title'> & { menuName?: string }

// Figma: 09
export default function RestaurantBottomSheet({ menuName = '쌀국수', ...props }: RestaurantBottomSheetProps) {
  const roomId = useMealRoom()
  const navigate = useNavigate()
  const { restaurantId } = useRoomMeal(roomId)
  const select = useMealStore(state => state.selectRestaurant)
  const complete = useMealStore(state => state.complete)
  return <BottomSheet {...props} showHandle className="meal-sheet restaurant-sheet" title="주변 식당">
    <p className="sheet-subtitle">{menuName} 기준 · 가까운 순</p>
    <div className="restaurant-list" role="radiogroup" aria-label="추천 식당">
      {restaurants.map(restaurant => <div className="meal-card restaurant-card" key={restaurant.id}>
        <span className="restaurant-monogram">{restaurant.monogram}</span>
        <div className="restaurant-info"><h3>{restaurant.name}</h3><p>{restaurant.distance}</p></div>
        <a className="map-link" href={`https://map.naver.com/p/search/${encodeURIComponent(restaurant.name)}`} target="_blank" rel="noreferrer" aria-label={`${restaurant.name} 네이버 지도에서 찾기`}>N 길찾기 ↗</a>
        <button type="button" className="restaurant-radio" role="radio" aria-checked={restaurantId === restaurant.id} aria-label={`${restaurant.name} 선택`}
          onClick={() => select(roomId, restaurant.id)}>{restaurantId === restaurant.id ? '✓' : ''}</button>
      </div>)}
    </div>
    <MealButton onClick={() => { complete(roomId); props.onClose(); navigate(`/room/${roomId}/complete`) }}>이 식당으로 확정하기</MealButton>
  </BottomSheet>
}
