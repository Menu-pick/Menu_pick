import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { Divider, MealButton, MealHeader, MealScreen, useMealRoom } from '../../features/meal/MealUI'
import { assets } from '../../features/meal/assets'
import { menus, useMealStore } from '../../features/meal/mealStore'

// Figma: 06 — fixture candidates, ready for the recommendation API.
export default function RoulettePage() {
  const [ready, setReady] = useState(false)
  const navigate = useNavigate()
  const roomId = useMealRoom()
  const reset = useMealStore(state => state.reset)
  useEffect(() => {
    const timer = window.setTimeout(() => setReady(true), 1800)
    return () => window.clearTimeout(timer)
  }, [])
  return <MealScreen className="slot-page">
    <MealHeader title="슬롯 추첨" />
    <div className={`meal-card slot-card ${ready ? 'is-ready' : 'is-spinning'}`}>
      <div className="slot-art"><img src={assets.slot.imgChatGptImage20269160937071} alt="메뉴 후보를 뽑는 슬롯 머신" /></div>
      <Divider />
      <p role="status">{ready ? '메뉴 후보가 준비됐어요. 함께 투표해볼까요?' : '음식 카테고리를 바탕으로 메뉴 후보를 뽑고 있어요.'}</p>
      {ready && <span className="sr-only">{menus.map(menu => menu.name).join(', ')}</span>}
    </div>
    <div className="meal-footer"><MealButton disabled={!ready} onClick={() => { reset(roomId); navigate(`/room/${roomId}/vote`) }}>투표하러 가기</MealButton></div>
  </MealScreen>
}
