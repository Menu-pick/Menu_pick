import { Link, useLocation, useParams } from 'react-router'
import type { RoomSettings } from '../Room/ExistingRoom'

export default function RoulettePage() {
  const { roomId = '' } = useParams()
  const { state } = useLocation()
  const settings = state?.existingRoomSettings as RoomSettings | undefined

  if (!settings) return <h1>Roulette Page</h1>

  return (
    <section className="room-setup">
      <header className="room-setup__header">
        <Link to={`/room/${encodeURIComponent(roomId)}`} aria-label="방 상세로 돌아가기" />
        <h1>새로운 식사 선택</h1>
      </header>
      <dl>
        <dt>방 이름</dt><dd>{settings.name}</dd>
        <dt>식사 장소</dt><dd>{settings.location || '미설정'}</dd>
        <dt>식사 방식</dt><dd>{settings.mealMode}</dd>
        <dt>음식 카테고리</dt><dd>{settings.categories.join(', ') || '미설정'}</dd>
      </dl>
      {/* TODO: Start the server meal session for this room once the session API is available. */}
    </section>
  )
}
