import { useNavigate, useSearchParams } from 'react-router'
import { Divider, MealButton, MealScreen, Notice, useMealRoom, useShare } from '../../features/meal/MealUI'
import { assets } from '../../features/meal/assets'
import { useMealStore, useRoomMeal } from '../../features/meal/mealStore'

// Figma: 10
export default function SelectionCompletePage() {
  const roomId = useMealRoom()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const { share, notice } = useShare()
  const room = useRoomMeal(roomId)
  const records = useMealStore(state => state.records)
  const recordId = params.get('record') ?? room.completedRecordId
  const record = recordId ? records.find(item => item.roomId === roomId && item.id === recordId) : records.findLast(item => item.roomId === roomId)
  const shareText = !record ? '' : record.mode === 'delivery'
    ? `${record.date} 오늘의 밥픽은 ${record.menu}! 사용하는 배달앱에서 주문해요.`
    : `${record.date} 오늘의 밥픽은 ${record.menu}! ${record.restaurant}에서 함께 먹어요.`
  return <MealScreen className="complete-page" background={assets.complete.img10}>
    <div className="meal-card complete-card"><img className="complete-illustration" src={assets.complete.imgChatGptImage20269210806541} alt="활짝 웃는 밥그릇" />
      <h1>선택 완료</h1><Divider /><p>오늘의 한끼가 정해졌어요.</p>
    </div>
    <div className="complete-actions"><MealButton disabled={!record} onClick={() => record && share(shareText, `${window.location.origin}/room/${roomId}/complete?record=${record.id}`)}>결과 공유하기</MealButton>
      <MealButton secondary onClick={() => navigate(`/room/${roomId}`)}>방으로 돌아가기</MealButton></div>
    <Notice>{notice}</Notice>
  </MealScreen>
}
