import { useNavigate, useSearchParams } from 'react-router'
import { MealButton, MealHeader, MealScreen, useMealRoom } from '../../features/meal/MealUI'
import { assets } from '../../features/meal/assets'
import { rankedMenus, useRoomMeal } from '../../features/meal/mealStore'
import RestaurantBottomSheet from '../Restaurant/RestaurantBottomSheet'
import DeliveryBottomSheet from '../Restaurant/DeliveryBottomSheet'
import MealErrorPage from '../Error/MealErrorPage'

// Figma: 08, 08-D, 09, 09-D. Mode and expanded sheet are shareable URL state.
export default function VoteResultPage() {
  const navigate = useNavigate()
  const roomId = useMealRoom()
  const [params, setParams] = useSearchParams()
  const delivery = params.get('mode') === 'delivery'
  const expanded = params.get('sheet') === 'open'
  const { votes } = useRoomMeal(roomId)
  const [winner, ...others] = rankedMenus(votes)
  const setSheet = (open: boolean) => setParams(previous => {
    const next = new URLSearchParams(previous)
    if (open) next.set('sheet', 'open'); else next.delete('sheet')
    return next
  })
  if (params.get('error') === 'E05') return <MealErrorPage code="E05" />
  if (params.get('error') === 'E06') return <MealErrorPage code="E06" />
  return <MealScreen className={`result-page ${expanded ? 'sheet-expanded' : ''}`} background={assets.result.imgChatGptImage20269150806211}>
    <MealHeader title="메뉴 확정하기" onBack={() => navigate(`/room/${roomId}/vote`)} />
    <section className="participants"><h2>참여자</h2><div className="participant-list">{[0, 1, 2, 3].map(index => <div className="participant" key={index}>
      <div className="participant-avatar"><img src={assets.result.imgEllipse4} alt="" /><img src={assets.result.imgEllipse7} alt="" /></div><span>박채희</span>
    </div>)}</div></section>
    <article className="meal-card winner-card"><div className="winner-crown"><img src={assets.result.imgEllipse4} alt="" /><img src={assets.result.imgFa7SolidCrown} alt="최다 득표" /></div>
      <img className="menu-photo" src={winner.image} alt={winner.name} /><div className="winner-copy"><h2>{winner.name}</h2><p>가장 많은 선택을 받았어요!</p></div><strong className="winner-score">{winner.count}/4</strong>
    </article>
    <div className="result-others">{others.map(menu => <article className="meal-card result-row" key={menu.id}><h2>{menu.name}</h2><strong>{menu.count}/4</strong></article>)}</div>
    <section className="result-collapsed-sheet"><span className="visual-handle" /><h2>{delivery ? '배달 주문' : '주변 식당'}</h2><p>{delivery ? '사용 중인 배달앱으로 주문해요' : `${winner.name} 맛집 3곳을 찾았어요`}</p>
      <MealButton onClick={() => setSheet(true)}>{delivery ? '배달앱 선택하기' : '추천 식당 보기'}</MealButton>
    </section>
    {delivery ? <DeliveryBottomSheet open={expanded} onClose={() => setSheet(false)} menuName={winner.name} /> : <RestaurantBottomSheet open={expanded} onClose={() => setSheet(false)} menuName={winner.name} />}
  </MealScreen>
}
