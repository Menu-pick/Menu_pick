import { useState } from 'react'
import { Link, useParams } from 'react-router'
import calendar from '../../assets/icons/akar-icons_calendar.svg'
import share from '../../assets/icons/basil_share-box-outline.svg'
import utensils from '../../assets/images/Bigforkspoon.png'
import divider from '../../assets/icons/ForkSpoon.png'
import { getRoomSettings, RoomTitle } from './ExistingRoom'
import './CreateRoomPage.css'
import './ExistingRoom.css'

export default function RoomDetailPage() {
  const { roomId = '' } = useParams()
  const base = `/room/${encodeURIComponent(roomId)}`
  const settings = getRoomSettings(roomId)
  const { name } = settings
  const [feedback, setFeedback] = useState('')

  async function shareRoom() {
    try {
      const url = window.location.href
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
    <div className="room-setup existing-room">
      <header className="existing-room__header">
        <Link to={`${base}/history`} aria-label="식사 기록"><img src={calendar} alt="" /></Link>
        <RoomTitle name={name} to={`${base}/settings`} />
        <button type="button" aria-label="방 링크 공유" onClick={shareRoom}><img src={share} alt="" /></button>
      </header>
      <p className="existing-room__feedback" role="status">{feedback}</p>
      <section className="existing-room__card">
        <div className="existing-room__utensils" aria-hidden="true">
          <img src={utensils} alt="" />
        </div>
        <div className="existing-room__divider"><img src={divider} alt="" /></div>
        <p>오늘은 뭘 먹을까요?</p>
      </section>
      <div className="room-setup__footer">
        <Link className="room-setup__primary existing-room__primary" to={`${base}/settings`}
          state={{ startMeal: true }}>새로운 식사 선택하기</Link>
      </div>
    </div>
  )
}
