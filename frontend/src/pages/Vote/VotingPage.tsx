import { useNavigate, useSearchParams } from 'react-router'
import MealErrorPage from '../Error/MealErrorPage'
import Button from '../../components/common/Button'
import { MealButton, MealHeader, MealScreen, useMealRoom } from '../../features/meal/MealUI'
import { menus, useMealStore, useRoomMeal } from '../../features/meal/mealStore'

// Figma: 07
export default function VotingPage() {
  const roomId = useMealRoom()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const { votes } = useRoomMeal(roomId)
  const vote = useMealStore(state => state.vote)
  const finished = menus.every(menu => votes[menu.id])
  if (params.get('error') === 'E04') return <MealErrorPage code="E04" />
  return <MealScreen className="voting-page">
    <MealHeader title="메뉴 투표하기" onBack={() => navigate(`/room/${roomId}/roulette`)} />
    <div className="vote-list">{menus.map(menu => <article className="meal-card vote-card" key={menu.id}>
      <img className={`menu-photo menu-${menu.id}`} src={menu.image} alt={menu.name} />
      <div className="vote-content"><h2>{menu.name}</h2><div className="vote-options" role="group" aria-label={`${menu.name} 투표`}>
        {(['like', 'dislike'] as const).map(choice => <Button key={choice} className={`vote-choice ${votes[menu.id] === choice ? 'is-selected' : ''}`}
          aria-pressed={votes[menu.id] === choice} onClick={() => vote(roomId, menu.id, choice)}>{choice === 'like' ? '좋아요' : '싫어요'}</Button>)}
      </div></div>
    </article>)}</div>
    <div className="meal-footer"><MealButton onClick={() => navigate(finished ? `/room/${roomId}/result` : `/room/${roomId}/vote?error=E04`)}>결과 확인하기</MealButton></div>
  </MealScreen>
}
