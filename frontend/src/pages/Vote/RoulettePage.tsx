import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { Divider, MealButton, MealHeader, MealScreen, useMealRoom } from '../../features/meal/MealUI'
import { assets } from '../../features/meal/assets'
import { useMealStore, useRoomMeal } from '../../features/meal/mealStore'

// Reuse the silhouettes in the original Figma slot artwork (1122 × 1402).
const slotSymbols = [
  { name: '피자', x: 238, y: 674 },
  { name: '수저', x: 484, y: 588 },
  { name: '밥', x: 480, y: 779 },
  { name: '햄버거', x: 722, y: 507 },
  { name: '국', x: 720, y: 672 },
]

// Figma: 06 — fixture candidates, ready for the recommendation API.
export default function RoulettePage() {
  const [ready, setReady] = useState(false)
  const [failed, setFailed] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const navigate = useNavigate()
  const roomId = useMealRoom()
  const room = useRoomMeal(roomId)
  const startMeal = useMealStore(state => state.startMeal)
  useEffect(() => {
    const generated = startMeal(roomId)
    setFailed(!generated)
    setReady(false)
    if (!generated) {
      navigate('/error/e07', { replace: true, state: { returnTo: `/room/${roomId}/settings`, returnState: { startMeal: true } } })
      return
    }
    if (!generated || !imageLoaded) return
    const timer = window.setTimeout(() => setReady(true), 1500)
    return () => window.clearTimeout(timer)
  }, [roomId, startMeal, imageLoaded, navigate])
  return <MealScreen className="slot-page">
    <MealHeader title="슬롯 추첨" />
    <div className={`meal-card slot-card ${ready ? 'is-ready' : !failed && imageLoaded ? 'is-spinning' : ''}`}>
      <div className="slot-art"><img src={assets.slot.imgChatGptImage20269160937071} alt="메뉴 후보를 뽑는 슬롯 머신" onLoad={() => setImageLoaded(true)} />
        {!failed && imageLoaded && <div className="slot-reels" aria-label={ready ? '추첨된 메뉴 후보' : '메뉴 추첨 중'}>{room.candidates.map((menu, index) => <div className={`slot-reel ${ready ? '' : 'is-rolling'}`} key={menu.id}>
          {ready ? <><img src={menu.image} alt="" /><span>{menu.name}</span></> : <div className="slot-reel-track" aria-hidden="true">{Array.from({ length: slotSymbols.length * 2 }, (_, frame) => {
            const symbol = slotSymbols[(frame + index * 2) % slotSymbols.length]
            return <div className="slot-reel-frame" key={frame}><span className="slot-symbol" data-symbol={symbol.name} style={{
              backgroundImage: `url(${assets.slot.imgChatGptImage20269160937071})`,
              backgroundPosition: `${symbol.x / (1122 - 160) * 100}% ${symbol.y / (1402 - 160) * 100}%`,
            }} /></div>
          })}</div>}
        </div>)}</div>}
      </div>
      <Divider />
      <p role="status">{failed ? '선택한 카테고리의 메뉴 후보가 부족해요.' : ready ? '메뉴 후보가 준비됐어요. 함께 투표해볼까요?' : '음식 카테고리를 바탕으로 메뉴 후보를 뽑고 있어요.'}</p>
    </div>
    <div className="meal-footer"><MealButton disabled={!ready} onClick={() => navigate(`/room/${roomId}/vote${room.options.mode === 'delivery' ? '?mode=delivery' : ''}`)}>투표하러 가기</MealButton></div>
  </MealScreen>
}
