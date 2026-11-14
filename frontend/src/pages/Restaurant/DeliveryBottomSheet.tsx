import BottomSheet, { type BottomSheetProps } from '../../features/meal/MealBottomSheet'
import { useNavigate } from 'react-router'
import { MealButton, useMealRoom } from '../../features/meal/MealUI'
import { allVotesComplete, uniqueWinner, useMealStore, useRoomMeal } from '../../features/meal/mealStore'

type DeliveryBottomSheetProps = Omit<BottomSheetProps, 'title'> & { menuName?: string }

const platforms = [
  { name: '배달의민족', monogram: '배', url: 'https://www.baemin.com/' },
  { name: '쿠팡이츠', monogram: '쿠', url: 'https://www.coupangeats.com/' },
  { name: '요기요', monogram: '요', url: 'https://www.yogiyo.co.kr/' },
]

// Figma: 09-D
export default function DeliveryBottomSheet({ menuName = '쌀국수', ...props }: DeliveryBottomSheetProps) {
  const roomId = useMealRoom()
  const navigate = useNavigate()
  const complete = useMealStore(state => state.complete)
  const room = useRoomMeal(roomId)
  return <BottomSheet {...props} showHandle className="meal-sheet delivery-sheet" title="배달로 주문하기">
    <p className="sheet-subtitle">주문은 사용중인 배달앱에서 직접 진행해주세요.</p>
    <div className="platform-list">{platforms.map(platform => <a className="meal-card platform-card" key={platform.name} href={platform.url} target="_blank" rel="noreferrer" aria-label={`${platform.name} 새 창에서 열기, ${menuName} 주문은 앱에서 직접 진행`}>
      <span className="platform-monogram">{platform.monogram}</span><strong>{platform.name}</strong><span className="platform-external" aria-hidden="true">↗</span>
    </a>)}</div>
    <MealButton disabled={!allVotesComplete(room) || !uniqueWinner(room)} onClick={() => {
      const record = complete(roomId, 'delivery')
      if (!record) return
      props.onClose()
      navigate(`/room/${roomId}/complete?mode=delivery&record=${record.id}`)
    }}>메뉴 확정하기</MealButton>
  </BottomSheet>
}
