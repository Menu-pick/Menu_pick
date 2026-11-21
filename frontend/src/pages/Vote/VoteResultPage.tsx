import { Navigate, useNavigate, useSearchParams } from 'react-router'
import { MealButton, MealHeader, MealScreen, useMealRoom } from '../../features/meal/MealUI'
import { assets } from '../../features/meal/assets'
import { allVotesComplete, hasTiedWinners, rankedMenus, restaurantRecommendations, useMealStore, useRoomMeal } from '../../features/meal/mealStore'
import retryIcon from '../../assets/meal/tie/retry.svg'
import RestaurantBottomSheet from '../Restaurant/RestaurantBottomSheet'
import DeliveryBottomSheet from '../Restaurant/DeliveryBottomSheet'

// Figma: 08, 08-D, 09, 09-D. Mode and expanded sheet are shareable URL state.
export default function VoteResultPage({ tieResult = false }: { tieResult?: boolean }) {
  const navigate = useNavigate()
  const roomId = useMealRoom()
  const [params, setParams] = useSearchParams()
  const room = useRoomMeal(roomId)
  const delivery = (params.get('mode') ?? room.options.mode) === 'delivery'
  const expanded = params.get('sheet') === 'open'
  const [winner, ...others] = rankedMenus(room)
  const catalog = useMealStore(state => state.restaurantCatalog)
  const { items: recommendations, preview } = restaurantRecommendations(room, catalog)
  const startMeal = useMealStore(state => state.startMeal)
  const ranking = [winner, ...others]
  const leaders = tieResult ? ranking.filter(menu => menu.count === winner.count) : [winner]
  const remaining = tieResult ? ranking.filter(menu => menu.count !== winner.count) : others
  const setSheet = (open: boolean) => setParams(previous => {
    const next = new URLSearchParams(previous)
    if (open) next.set('sheet', 'open'); else next.delete('sheet')
    return next
  })
  if (!tieResult && allVotesComplete(room) && hasTiedWinners(room)) {
    return <Navigate to={`/room/${roomId}/result/tie${delivery ? '?mode=delivery' : ''}`} replace />
  }
  return <MealScreen className={`result-page ${delivery ? 'delivery-result' : ''} ${tieResult ? 'tie-result' : ''}`} background={assets.result.imgChatGptImage20269150806211}>
    <div className="result-scroll-content" role="region" aria-label={delivery ? '배달 메뉴 투표 결과' : '메뉴 투표 결과'} tabIndex={0}>
    <MealHeader title="메뉴 확정하기" onBack={() => navigate(`/room/${roomId}/vote${delivery ? '?mode=delivery' : ''}`)} />
    <section className="participants"><h2>참여자</h2><div className="participant-list">{room.participants.map(member => <div className="participant" key={member.id}>
      <div className="participant-avatar"><img src={assets.result.imgEllipse4} alt="" /><img src={member.image} alt="" /></div><span>{member.name}</span>
    </div>)}</div></section>
    {leaders.map(menu => <article className="meal-card winner-card" key={menu.id}><div className="winner-crown"><img src={assets.result.imgEllipse4} alt="" /><img src={assets.result.imgFa7SolidCrown} alt="최다 득표" /></div>
      <img className="menu-photo" src={menu.image} alt={menu.name} /><div className="winner-copy"><h2>{menu.name}</h2><p>가장 많은 선택을 받았어요!</p></div><strong className="winner-score">{menu.count}/{room.participants.length}</strong>
    </article>)}
    <div className="result-others">{remaining.map(menu => <article className="meal-card result-row" key={menu.id}><h2>{menu.name}</h2><strong>{menu.count}/{room.participants.length}</strong></article>)}</div>
    </div>
    {tieResult ? <div className="meal-footer tie-footer"><p>최다 득표 메뉴가 동률이에요! 다시 뽑아주세요</p><MealButton onClick={() => {
      if (!startMeal(roomId, true)) { navigate('/error/e07'); return }
      navigate(`/room/${roomId}/roulette${delivery ? '?mode=delivery' : ''}`)
    }}><img src={retryIcon} alt="" />재추첨하기</MealButton></div> : <><section className={`result-collapsed-sheet ${delivery ? 'delivery-summary' : ''}`}><span className="visual-handle" /><h2>{delivery ? '배달 주문' : '주변 식당'}</h2><p>{delivery ? '메뉴가 확정되면 각자 사용하는 배달앱에서 검색해 주문할 수 있어요.' : preview ? `주변 식당 예시 ${recommendations.length}곳을 준비했어요` : `${winner.name} 맛집 ${recommendations.length}곳을 찾았어요`}</p>
      <MealButton onClick={() => {
        if (!delivery && recommendations.length === 0) { navigate('/error/e05', { state: { returnTo: `/room/${roomId}/result` } }); return }
        setSheet(true)
      }}>{delivery ? '메뉴 확정하기' : '추천 식당 보기'}</MealButton>
    </section>
    {delivery ? <DeliveryBottomSheet open={expanded} onClose={() => setSheet(false)} menuName={winner.name} /> : <RestaurantBottomSheet open={expanded} onClose={() => setSheet(false)} menuName={winner.name} />}</>}
  </MealScreen>
}
