import { useState, type ReactNode } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { isApiRoom, mealErrorCode, mealErrorMessage, MealApiError } from '../../features/meal/mealApi'
import { useLocalRoom, useRoomStore } from '../../features/room/roomStore'
import { startRoomMeal } from '../../features/room/startRoomMeal'
import { useRoomRequest } from '../../features/room/useRoomRequest'
import calendar from '../../assets/icons/akar-icons_calendar.svg'
import share from '../../assets/icons/basil_share-box-outline.svg'
import utensils from '../../assets/images/Bigforkspoon.png'
import divider from '../../assets/icons/ForkSpoon.png'
import { getRoomSettings, RoomTitle } from './ExistingRoom'
import './CreateRoomPage.css'
import './ExistingRoom.css'

export default function RoomDetailPage({ overlay }: { overlay?: ReactNode }) {
  const { roomId = '' } = useParams()
  const base = `/room/${encodeURIComponent(roomId)}`
  const settings = getRoomSettings(roomId)
  const { name } = settings
  const room = useLocalRoom(roomId)
  const [feedback, setFeedback] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const { pending, run } = useRoomRequest()

  function selectMeal() {
    void run(async () => {
      setError('')
      try {
        if (isApiRoom(roomId)) {
          await startRoomMeal(roomId)
        } else {
          const result = useRoomStore.getState().beginMeal(roomId)
          if (result === 'waiting') throw new MealApiError('e03', '친구가 참여하면 메뉴 후보를 뽑을 수 있어요.')
          if (result !== 'ok') throw new MealApiError('e07', '메뉴 후보를 뽑지 못했어요.')
        }
        void navigate(`${base}/roulette`)
      } catch (error) {
        const code = mealErrorCode(error)
        if (code === 'e07') {
          setError(mealErrorMessage(error))
          return
        }
        const roomCode = room?.code ?? ''
        const joinLink = `/room/select/code?code=${encodeURIComponent(roomCode)}`
        void navigate(`/error/${code}`, { state: {
          roomCode,
          returnTo: code === 'e02' ? joinLink : code === 'e01' ? '/home' : base,
        } })
      }
    })
  }

  async function shareRoom() {
    try {
      const invite = new URL('/room/select/code', window.location.origin)
      if (room?.code) invite.searchParams.set('code', room.code)
      const url = room?.demo ? window.location.href : invite.href
      if (navigator.share) await navigator.share({ title: name, url })
      else {
        await navigator.clipboard.writeText(url)
        setFeedback('방 링크를 복사했어요.')
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return
      setFeedback('방 링크를 공유하지 못했어요.')
    }
  }

  return (
    <div className={`room-setup existing-room${overlay ? ' existing-room--overlay' : ''}`}>
      <header className="existing-room__header existing-room__header--detail" inert={Boolean(overlay)}>
        <Link className="existing-room__back" to="/home" aria-label="홈으로 돌아가기" />
        <Link className="existing-room__calendar" to={`${base}/history`} aria-label="식사 기록"><img src={calendar} alt="" /></Link>
        <RoomTitle name={name} to={`${base}/settings`} showArrow={false} />
        <button type="button" aria-label="방 링크 공유" onClick={shareRoom}><img src={share} alt="" /></button>
      </header>
      <p className="existing-room__feedback" role="status" inert={Boolean(overlay)}>{feedback}</p>
      <section className="existing-room__card" inert={Boolean(overlay)}>
        <div className="existing-room__utensils" aria-hidden="true">
          <img src={utensils} alt="" />
        </div>
        <div className="existing-room__divider"><img src={divider} alt="" /></div>
        <p>오늘은 뭘 먹을까요?</p>
      </section>
      <div className="room-setup__footer existing-room__footer" inert={Boolean(overlay)}>
        <Link className="existing-room__return" to="/home">돌아가기</Link>
        {error && <p role="alert">{error}</p>}
        <button className="room-setup__primary existing-room__primary" type="button" disabled={pending} onClick={selectMeal}>
          {pending ? '식사 정보를 불러오는 중…' : '새로운 식사 선택하기'}
        </button>
      </div>
      {overlay}
    </div>
  )
}
