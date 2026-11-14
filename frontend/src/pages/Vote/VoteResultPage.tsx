import { useNavigate, useSearchParams } from 'react-router'
import { MealButton, MealHeader, MealScreen, useMealRoom } from '../../features/meal/MealUI'
import { assets } from '../../features/meal/assets'
import { rankedMenus, restaurantRecommendations, useMealStore, useRoomMeal } from '../../features/meal/mealStore'
import RestaurantBottomSheet from '../Restaurant/RestaurantBottomSheet'
import DeliveryBottomSheet from '../Restaurant/DeliveryBottomSheet'

// Figma: 08, 08-D, 09, 09-D. Mode and expanded sheet are shareable URL state.
export default function VoteResultPage() {
  const navigate = useNavigate()
  const roomId = useMealRoom()
  const [params, setParams] = useSearchParams()
  const room = useRoomMeal(roomId)
  const delivery = (params.get('mode') ?? room.options.mode) === 'delivery'
  const expanded = params.get('sheet') === 'open'
  const [winner, ...others] = rankedMenus(room)
  const catalog = useMealStore(state => state.restaurantCatalog)
  const { items: recommendations, preview } = restaurantRecommendations(room, catalog)
  const setSheet = (open: boolean) => setParams(previous => {
    const next = new URLSearchParams(previous)
    if (open) next.set('sheet', 'open'); else next.delete('sheet')
    return next
  })
  return <MealScreen className={`result-page ${delivery ? 'delivery-result' : ''} ${expanded ? 'sheet-expanded' : ''}`} background={assets.result.imgChatGptImage20269150806211}>
    <div className="result-scroll-content" role="region" aria-label={delivery ? '배달 메뉴 투표 결과' : '메뉴 투표 결과'} tabIndex={0}>
    <MealHeader title="메뉴 확정하기" onBack={() => navigate(`/room/${roomId}/vote${delivery ? '?mode=delivery' : ''}`)} />
    <section className="participants"><h2>참여자</h2><div className="participant-list">{room.participants.map(member => <div className="participant" key={member.id}>
      <div className="participant-avatar"><img src={assets.result.imgEllipse4} alt="" /><img src={member.image} alt="" /></div><span>{member.name}</span>
    </div>)}</div></section>
    <article className="meal-card winner-card"><div className="winner-crown"><img src={assets.result.imgEllipse4} alt="" /><img src={assets.result.imgFa7SolidCrown} alt="최다 득표" /></div>
      <img className="menu-photo" src={winner.image} alt={winner.name} /><div className="winner-copy"><h2>{winner.name}</h2><p>가장 많은 선택을 받았어요!</p></div><strong className="winner-score">{winner.count}/{room.participants.length}</strong>
    </article>
    <div className="result-others">{others.map(menu => <article className="meal-card result-row" key={menu.id}><h2>{menu.name}</h2><strong>{menu.count}/{room.participants.length}</strong></article>)}</div>
    </div>
    <section className={`result-collapsed-sheet ${delivery ? 'delivery-summary' : ''}`}><span className="visual-handle" /><h2>{delivery ? '배달 주문' : '주변 식당'}</h2><p>{delivery ? '메뉴가 확정되면 각자 사용하는 배달앱에서 검색해 주문할 수 있어요.' : preview ? `주변 식당 예시 ${recommendations.length}곳을 준비했어요` : `${winner.name} 맛집 ${recommendations.length}곳을 찾았어요`}</p>
      <MealButton onClick={() => {
        if (!delivery && recommendations.length === 0) { navigate('/error/e05', { state: { returnTo: `/room/${roomId}/result` } }); return }
        setSheet(true)
      }}>{delivery ? '메뉴 확정하기' : '추천 식당 보기'}</MealButton>
    </section>
    {delivery ? <DeliveryBottomSheet open={expanded} onClose={() => setSheet(false)} menuName={winner.name} /> : <RestaurantBottomSheet open={expanded} onClose={() => setSheet(false)} menuName={winner.name} />}
  </MealScreen>
}
