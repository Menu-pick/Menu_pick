import { useState, type FormEvent } from 'react'
import submitArrow from '../../assets/icons/Vector.svg'
import RoomSelectionLayout from './RoomSelectionLayout'

export default function RoomCodePage() {
  const [code, setCode] = useState('')

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const roomCode = code.trim()
    if (!roomCode) return
    // TODO: Submit roomCode via the join API and show a field error for invalid or expired codes.
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
