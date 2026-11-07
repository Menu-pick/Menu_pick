import { useNavigate } from 'react-router'
import { Divider, MealButton, MealScreen, Notice, useMealRoom, useShare } from '../../features/meal/MealUI'
import { assets } from '../../features/meal/assets'
import { rankedMenus, restaurants, useRoomMeal } from '../../features/meal/mealStore'

// Figma: 10
export default function SelectionCompletePage() {
  const roomId = useMealRoom()
  const navigate = useNavigate()
  const { share, notice } = useShare()
  const room = useRoomMeal(roomId)
  const winner = rankedMenus(room.votes)[0]
  const restaurant = restaurants.find(item => item.id === room.restaurantId)
  return <MealScreen className="complete-page" background={assets.complete.img10}>
    <div className="meal-card complete-card"><img className="complete-illustration" src={assets.complete.imgChatGptImage20269210806541} alt="활짝 웃는 밥그릇" />
      <h1>선택 완료</h1><Divider /><p>오늘의 한끼가 정해졌어요.</p>
    </div>
    <div className="complete-actions"><MealButton onClick={() => share(`오늘의 밥픽은 ${winner.name}! ${restaurant?.name ?? ''}에서 함께 먹어요.`, `${window.location.origin}/room/${roomId}/result`)}>결과 공유하기</MealButton>
      <MealButton secondary onClick={() => navigate(`/room/${roomId}`)}>방으로 돌아가기</MealButton></div>
    <Notice>{notice}</Notice>
  </MealScreen>
}
