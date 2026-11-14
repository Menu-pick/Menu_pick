import { useState, type FormEvent } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { useRoomStore } from '../../features/room/roomStore'
import submitArrow from '../../assets/icons/Vector.svg'
import RoomSelectionLayout from './RoomSelectionLayout'

export default function RoomCodePage() {
  const [searchParams] = useSearchParams()
  const [code, setCode] = useState(() => searchParams.get('code') ?? '')
  const navigate = useNavigate()

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const roomCode = code.trim()
    if (!roomCode) return
    const room = useRoomStore.getState().joinByCode(roomCode)
    if (!room) {
      void navigate('/error/e02', { state: { returnTo: `/room/select/code?code=${encodeURIComponent(roomCode)}` } })
      return
    }
    void navigate(`/room/${encodeURIComponent(room.id)}/waiting`)
  }

  return (
    <RoomSelectionLayout createLink="/room/select">
      <form className="room-select room-select--code" onSubmit={handleSubmit}>
        <label htmlFor="room-select-code">코드로 참여하기</label>
        <div className="room-select__code-row">
          <input
            id="room-select-code"
            name="roomCode"
            value={code}
            onChange={(event) => setCode(event.target.value)}
            autoComplete="off"
            required
          />
          <button type="submit" aria-label="참여 코드 제출" disabled={!code.trim()}>
            <img src={submitArrow} alt="" width="11" height="8" />
          </button>
        </div>
      </form>
    </RoomSelectionLayout>
  )
}
