import BottomSheet, { type BottomSheetProps } from '../../features/meal/MealBottomSheet'
import { MealButton, useMealRoom } from '../../features/meal/MealUI'
import { allVotesComplete, recommendedRestaurants, useMealStore, useRoomMeal } from '../../features/meal/mealStore'
import { useNavigate } from 'react-router'
import { useEffect } from 'react'

type RestaurantBottomSheetProps = Omit<BottomSheetProps, 'title'> & { menuName?: string }

// Figma: 09
export default function RestaurantBottomSheet({ menuName = '쌀국수', ...props }: RestaurantBottomSheetProps) {
  const roomId = useMealRoom()
  const navigate = useNavigate()
  const room = useRoomMeal(roomId)
  const { restaurantId } = room
  const catalog = useMealStore(state => state.restaurantCatalog)
  const restaurants = recommendedRestaurants(room, catalog)
  const selected = restaurants.find(item => item.id === restaurantId)
  const firstRestaurantId = restaurants[0]?.id
  const select = useMealStore(state => state.selectRestaurant)
  const complete = useMealStore(state => state.complete)
  useEffect(() => {
    if (!selected && firstRestaurantId && !room.completedRecordId) select(roomId, firstRestaurantId)
  }, [selected, firstRestaurantId, room.completedRecordId, roomId, select])
  return <BottomSheet {...props} showHandle className="meal-sheet restaurant-sheet" title="주변 식당">
    <p className="sheet-subtitle">{menuName} 기준 · 가까운 순</p>
    <div className="restaurant-list" role="radiogroup" aria-label="추천 식당">
      {restaurants.map(restaurant => <div className="meal-card restaurant-card" key={restaurant.id}>
        <span className="restaurant-monogram">{restaurant.monogram}</span>
        <div className="restaurant-info"><h3>{restaurant.name}</h3><p>{restaurant.distance}</p></div>
        <a className="map-link" href={restaurant.mapUrl} target="_blank" rel="noreferrer" aria-label={`${restaurant.name} 네이버 지도에서 찾기`}>N 길찾기 ↗</a>
        <button type="button" className="restaurant-radio" role="radio" aria-checked={restaurantId === restaurant.id} aria-label={`${restaurant.name} 선택`}
          onClick={() => select(roomId, restaurant.id)}>{restaurantId === restaurant.id ? '✓' : ''}</button>
      </div>)}
    </div>
    <MealButton disabled={!selected || !allVotesComplete(room)} onClick={() => {
      const record = complete(roomId, 'restaurant')
      if (!record) return
      props.onClose()
      navigate(`/room/${roomId}/complete?record=${record.id}`)
    }}>이 식당으로 확정하기</MealButton>
  </BottomSheet>
}
