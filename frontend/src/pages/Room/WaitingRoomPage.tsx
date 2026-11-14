import { useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router'
import { useLocalRoom, useRoomStore } from '../../features/room/roomStore'
import copyIcon from '../../assets/icons/copy.svg'
import forkSpoon from '../../assets/icons/ForkSpoon.png'
import './CreateRoomPage.css'
import './WaitingRoomPage.css'

export default function WaitingRoomPage() {
  const [feedback, setFeedback] = useState('')
  const location = useLocation()
  const navigate = useNavigate()
  const { roomId = '' } = useParams()
  const room = useLocalRoom(roomId)
  const roomCode = room?.code ?? ''
  const members = room?.members ?? []

  function startMeal() {
    const result = useRoomStore.getState().beginMeal(roomId)
    if (result !== 'ok') {
      void navigate(result === 'waiting' ? '/error/e03' : '/error/e07', { state: { roomCode, returnTo: `/room/${encodeURIComponent(roomId)}/settings`, returnState: { startMeal: true } } })
      return
    }
    void navigate(`/room/${encodeURIComponent(roomId)}/roulette`)
  }

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(roomCode)
      setFeedback('방 코드를 복사했어요.')
    } catch {
      setFeedback('방 코드를 복사하지 못했어요.')
    }
  }

  async function shareLink() {
    const url = new URL('/room/select/code', window.location.origin)
    url.searchParams.set('code', roomCode)
    try {
      if (navigator.share) {
        await navigator.share({ title: '밥픽 방 초대', url: url.href })
        setFeedback('')
      } else {
        await navigator.clipboard.writeText(url.href)
        setFeedback('초대 링크를 복사했어요.')
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return
      setFeedback('초대 링크를 공유하지 못했어요.')
    }
  }

  return (
    <div className="room-setup room-waiting-page">
      <header className="room-setup__header">
        <Link to="/room/create" aria-label="방 만들기로 돌아가기" onClick={(event) => {
          if (location.state?.fromCreate && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) {
            event.preventDefault()
            void navigate(-1)
          }
        }} />
      </header>
      <section className="room-waiting-page__card room-waiting-page__invite">
        <h1>방 코드</h1>
        <div className="room-waiting-page__code">
          <span>{roomCode}</span>
          <button type="button" aria-label="방 코드 복사" onClick={copyCode}>
            <img src={copyIcon} alt="" width="29" height="29" />
          </button>
        </div>
        <button className="room-setup__primary room-waiting-page__share" type="button" onClick={shareLink}>
          링크 공유하기
        </button>
        <p className="room-waiting-page__feedback" role="status">{feedback}</p>
      </section>
      <section className="room-waiting-page__card room-waiting-page__members">
        <h2>참여 중인 멤버</h2>
        <ul>
          {members.map((member) => (
            <li key={member.id}>
              <img src={member.image} alt="" width="53" height="53" />
              <span>{member.name}</span>
            </li>
          ))}
        </ul>
        <div className="room-waiting-page__divider" aria-hidden="true">
          <img src={forkSpoon} alt="" />
        </div>
        <p>친구들이 모였다면 메뉴후보를 뽑을까요?</p>
      </section>
      <div className="room-setup__footer">
        <button className="room-setup__primary" type="button" onClick={startMeal}>메뉴 후보 뽑기</button>
      </div>
    </div>
  )
}
