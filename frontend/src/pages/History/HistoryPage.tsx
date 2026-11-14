import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import Button from '../../components/common/Button'
import Calendar from '../../features/meal/Calendar'
import { useMealRoom } from '../../features/meal/MealUI'
import { localDate, parseLocalDate, useMealStore } from '../../features/meal/mealStore'
import { useRestaurantHistory } from '../../features/meal/useRestaurantHistory'
import RoomDetailPage from '../Room/RoomDetailPage'

// Figma: 13, 14
export default function HistoryPage() {
  const roomId = useMealRoom()
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const sheetRef = useRef<HTMLElement>(null)
  const closeCalendar = useCallback(() => {
    navigate(`/room/${encodeURIComponent(roomId)}`, { replace: true })
  }, [navigate, roomId])
  useEffect(() => {
    sheetRef.current?.focus()
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); closeCalendar(); return }
      if (event.key !== 'Tab') return
      const controls = Array.from(sheetRef.current?.querySelectorAll<HTMLElement>('button:not(:disabled), select, a[href]') ?? [])
      const first = controls[0]
      const last = controls.at(-1)
      if (!first || !last) return
      if (event.shiftKey && (document.activeElement === first || document.activeElement === sheetRef.current)) { event.preventDefault(); last.focus() }
      else if (!event.shiftKey && (document.activeElement === last || document.activeElement === sheetRef.current)) { event.preventDefault(); first.focus() }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [closeCalendar])
  const queryDate = params.get('date')
  const selected = localDate(parseLocalDate(queryDate) ?? new Date())
  const selectedMonth = selected.slice(0, 7)
  const [month, setMonth] = useState(() => new Date(`${selectedMonth}-01T12:00:00`))
  useEffect(() => setMonth(new Date(`${selectedMonth}-01T12:00:00`)), [selectedMonth])
  const detail = params.get('view') === 'day'
  const records = useMealStore(state => state.records)
  const remote = useRestaurantHistory(roomId, month, selected)
  useEffect(() => {
    if (remote.error) navigate('/error/e06', { replace: true, state: { returnTo: `/room/${roomId}/history?view=day&date=${selected}` } })
  }, [remote.error, navigate, roomId, selected])
  const recordedDates = [...new Set([...remote.dates, ...records.filter(record => record.roomId === roomId).map(record => record.date)])]
  const dayRecords = records.filter(record => record.roomId === roomId && record.date === selected)
  const chooseDate = (date: string) => {
    setParams({ view: 'day', date })
  }
  const dateLabel = new Date(`${selected}T12:00:00`).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' })
  return <RoomDetailPage overlay={<div className="history-overlay" role="dialog" aria-modal="true" aria-label="식사 기록 달력">
    <Button className="history-dismiss" aria-label="달력 밖 배경 눌러 닫기" onClick={closeCalendar} tabIndex={-1} />
    <section ref={sheetRef} className={`history-sheet ${detail ? 'is-detail' : ''}`} aria-label="이전 식사 기록" tabIndex={-1}><Button className="history-handle" aria-label="달력 닫기" onClick={closeCalendar} />
      <Calendar month={month} selected={selected} recordedDates={recordedDates} onMonthChange={setMonth} onSelect={chooseDate} />
      {detail && <div className="history-records"><h2>{dateLabel}</h2>{dayRecords.map(record => <article className="meal-card history-record" key={record.id}><h3>{record.menu}</h3><p>{record.restaurant}</p></article>)}
        {remote.records.map(record => <article className="meal-card history-record" key={`remote-${record.id}`}><h3>{record.name}</h3><p>{record.address}</p></article>)}
        {dayRecords.length === 0 && remote.records.length === 0 && <p className="history-empty">이 날짜에는 아직 식사 기록이 없어요.</p>}</div>}
    </section>
  </div>} />
}
