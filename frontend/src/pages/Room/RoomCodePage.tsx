import { useRef, useState, type FormEvent } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router'
import { useRoomStore } from '../../features/room/roomStore'
import submitArrow from '../../assets/icons/Vector.svg'
import codeIcon from '../../assets/icons/andrsrxn_barcode-scan.svg'
import personIcon from '../../assets/icons/bi_person-circle.svg'
import HomeScreen from '../../components/home/HomeScreen'

export default function RoomCodePage() {
  const [searchParams] = useSearchParams()
  const { state } = useLocation()

  return (
    <HomeScreen showCreateRays={false}>
      <RoomJoinForm initialCode={searchParams.get('code') ?? ''}
        initialNickname={typeof state?.nickname === 'string' ? state.nickname : ''} />
    </HomeScreen>
  )
}

export function RoomJoinForm({ initialCode = '', initialNickname = '' } = {}) {
  const [code, setCode] = useState(initialCode)
  const [nickname, setNickname] = useState(initialNickname)
  const nicknameInput = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const roomCode = code.trim()
    const memberName = nickname.trim()
    if (!roomCode || !memberName) return
    const room = useRoomStore.getState().joinByCode(roomCode, memberName)
    if (!room) {
      void navigate('/error/e02', { state: {
        returnTo: `/room/select/code?code=${encodeURIComponent(roomCode)}`,
        returnState: { nickname: memberName },
      } })
      return
    }
    void navigate(`/room/${encodeURIComponent(room.id)}/waiting`)
  }

  return (
    <form className="room-join" aria-labelledby="room-join-title" onSubmit={handleSubmit}>
      <h2 id="room-join-title">코드로 참여하기</h2>
      <div className="room-join__row">
        <img src={codeIcon} alt="" width="13" height="13" />
        <input
          name="roomCode"
          aria-label="방 코드"
          placeholder="코드를 입력해주세요."
          value={code}
          onChange={(event) => setCode(event.target.value)}
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          required
        />
        <button type="button" aria-label="닉네임 입력으로 이동" disabled={!code.trim()}
          onClick={() => nicknameInput.current?.focus()}>
          <img src={submitArrow} alt="" width="11" height="8" />
        </button>
      </div>
      <div className="room-join__row">
        <img src={personIcon} alt="" width="13" height="13" />
        <input ref={nicknameInput} name="nickname" aria-label="참여할 닉네임"
          placeholder="참여할 닉네임을 입력해주세요." autoComplete="nickname" required
          value={nickname} onChange={(event) => setNickname(event.target.value)} />
        <button type="submit" aria-label="방 참여하기" disabled={!code.trim() || !nickname.trim()}>
          <img src={submitArrow} alt="" width="11" height="8" />
        </button>
      </div>
    </form>
  )
}
