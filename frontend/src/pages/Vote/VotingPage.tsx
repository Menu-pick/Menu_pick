import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import Button from '../../components/common/Button'
import { MealButton, MealHeader, MealScreen, useMealRoom } from '../../features/meal/MealUI'
import { allVotesComplete, currentVotes, useMealStore, useRoomMeal } from '../../features/meal/mealStore'

// Figma: 07
export default function VotingPage() {
  const roomId = useMealRoom()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const room = useRoomMeal(roomId)
  const votes = currentVotes(room)
  const startMeal = useMealStore(state => state.startMeal)
  const vote = useMealStore(state => state.vote)
  const finished = allVotesComplete(room)
  const modeSuffix = (params.get('mode') ?? room.options.mode) === 'delivery' ? '?mode=delivery' : ''
  useEffect(() => { if (!room.started) startMeal(roomId) }, [roomId, room.started, startMeal])
  return <MealScreen className="voting-page">
    <MealHeader title="메뉴 투표하기" onBack={() => navigate(`/room/${roomId}/roulette`)} />
    <div className="vote-list">{room.candidates.map(menu => <article className="meal-card vote-card" key={menu.id}>
      <img className={`menu-photo menu-${menu.id}`} src={menu.image} alt={menu.name} />
      <div className="vote-content"><h2>{menu.name}</h2><div className="vote-options" role="group" aria-label={`${menu.name} 투표`}>
        {(['like', 'dislike'] as const).map(choice => <Button key={choice} className={`vote-choice ${votes[menu.id] === choice ? 'is-selected' : ''}`}
          aria-pressed={votes[menu.id] === choice} disabled={Boolean(room.completedRecordId)} onClick={() => vote(roomId, menu.id, choice)}>{choice === 'like' ? '좋아요' : '싫어요'}</Button>)}
      </div></div>
    </article>)}</div>
    <div className="meal-footer"><MealButton onClick={() => {
      if (!finished) { navigate('/error/e04', { state: { returnTo: `/room/${roomId}/vote${modeSuffix}` } }); return }
      navigate(`/room/${roomId}/result${modeSuffix}`)
    }}>결과 확인하기</MealButton></div>
  </MealScreen>
}
