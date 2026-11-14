import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router'
import apiClient from '../../api/apiClient'
import '../Room/CreateRoomPage.css'
import './HistoryPage.css'

type Restaurant = { id: number; name: string; address: string }

export default function HistoryPage() {
  const { roomId = '' } = useParams()
  return <RoomHistory key={roomId} roomId={roomId} />
}

function RoomHistory({ roomId }: { roomId: string }) {
  const [month, setMonth] = useState(() => {
    const today = new Date()
    return new Date(today.getFullYear(), today.getMonth(), 1)
  })
  const [dates, setDates] = useState<string[]>([])
  const [selected, setSelected] = useState('')
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [monthError, setMonthError] = useState(false)
  const [dateError, setDateError] = useState(false)
  const year = month.getFullYear()
  const monthNumber = month.getMonth() + 1
  const path = `/api/rooms/${encodeURIComponent(roomId)}/restaurants`

  useEffect(() => {
    const controller = new AbortController()
    apiClient.get<string[]>(`${path}/dates`, {
      params: { year, month: monthNumber }, signal: controller.signal,
    }).then(({ data }) => {
      if (!controller.signal.aborted) setDates(data)
    }).catch(() => {
      if (!controller.signal.aborted) setMonthError(true)
    })
    return () => controller.abort()
  }, [path, year, monthNumber])

  const hasRecord = dates.includes(selected)
  useEffect(() => {
    if (!hasRecord) return
    const controller = new AbortController()
    apiClient.get<Restaurant[]>(path, {
      params: { date: selected }, signal: controller.signal,
    }).then(({ data }) => {
      if (!controller.signal.aborted) setRestaurants(data)
    }).catch(() => {
      if (!controller.signal.aborted) setDateError(true)
    })
    return () => controller.abort()
  }, [path, selected, hasRecord])

  function changeMonth(offset: number) {
    setDates([])
    setSelected('')
    setRestaurants([])
    setMonthError(false)
    setDateError(false)
    setMonth(new Date(year, monthNumber - 1 + offset, 1))
  }

  return (
    <div className="room-setup room-history">
      <header className="room-setup__header">
        <Link to={`/room/${encodeURIComponent(roomId)}`} aria-label="방 상세로 돌아가기" />
        <h1>식사 기록</h1>
      </header>
      <section className="room-history__calendar" aria-label="식사 기록 달력">
        <div className="room-history__month">
          <button type="button" onClick={() => changeMonth(-1)} aria-label="이전 달">‹</button>
          <strong>{year}년 {monthNumber}월</strong>
          <button type="button" onClick={() => changeMonth(1)} aria-label="다음 달">›</button>
        </div>
        <div className="room-history__days">
          {['일', '월', '화', '수', '목', '금', '토'].map((day) => <span key={day}>{day}</span>)}
          {Array.from({ length: month.getDay() }, (_, index) => <span key={`blank-${index}`} />)}
          {Array.from({ length: new Date(year, monthNumber, 0).getDate() }, (_, index) => {
            const day = index + 1
            const date = `${year}-${String(monthNumber).padStart(2, '0')}-${String(day).padStart(2, '0')}`
            const recorded = dates.includes(date)
            return (
              <button key={date} type="button" data-recorded={recorded}
                aria-label={`${day}일${recorded ? ', 식사 기록 있음' : ''}`}
                aria-pressed={selected === date}
                onClick={() => {
                  if (selected === date) return
                  setRestaurants([])
                  setDateError(false)
                  setSelected(date)
                }}>
                {day}
              </button>
            )
          })}
        </div>
      </section>
      {monthError && <p role="alert">식사 기록 날짜를 불러오지 못했어요.</p>}
      {dateError && <p role="alert">확정 식당을 불러오지 못했어요.</p>}
      {restaurants.length > 0 && (
        <section className="room-history__calendar">
          <h2>{selected}</h2>
          <ul>{restaurants.map(({ id, name, address }) => <li key={id}>{name}<br />{address}</li>)}</ul>
        </section>
      )}
    </div>
  )
}
