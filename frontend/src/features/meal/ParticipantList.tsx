import { useEffect, useRef, useState } from 'react'
import { assets } from './assets'
import type { Participant } from './mealStore'

export default function ParticipantList({ participants }: { participants: Participant[] }) {
  const viewport = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState(0)
  const scrollable = participants.length >= 5
  const syncPosition = () => {
    const element = viewport.current
    if (!element) return
    const max = element.scrollWidth - element.clientWidth
    setPosition(max > 0 ? Math.round(element.scrollLeft / max * 1000) : 0)
  }
  useEffect(() => {
    const element = viewport.current
    if (!element) return
    const observer = new ResizeObserver(syncPosition)
    observer.observe(element)
    syncPosition()
    return () => observer.disconnect()
  }, [participants.length])
  return <section className={`participants ${scrollable ? 'participants--scrollable' : ''}`}>
    <h2>참여자</h2>
    <div ref={viewport} className="participant-list" role="region" aria-label="참여자 목록" tabIndex={0} onScroll={syncPosition}>
      {participants.map(member => <div className="participant" key={member.id}>
        <div className="participant-avatar"><img src={assets.result.imgEllipse4} alt="" /><img src={member.image} alt="" /></div>
        <span title={member.name}>{member.name}</span>
      </div>)}
    </div>
    {scrollable && <input className="participant-scrollbar" type="range" min={0} max={1000} value={position} aria-label="참여자 목록 가로 스크롤" onChange={event => {
      const next = Number(event.target.value)
      setPosition(next)
      const element = viewport.current
      if (element) element.scrollLeft = (element.scrollWidth - element.clientWidth) * next / 1000
    }} />}
  </section>
}
