import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import Button from '../../components/common/Button'
import Calendar from '../../features/meal/Calendar'
import { Divider, MealScreen, Notice, useMealRoom, useShare } from '../../features/meal/MealUI'
import { assets } from '../../features/meal/assets'
import { localDate, useMealStore } from '../../features/meal/mealStore'

// Figma: 13, 14
export default function HistoryPage() {
  const roomId = useMealRoom()
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const queryDate = params.get('date')
  const initialDate = queryDate && /^\d{4}-\d{2}-\d{2}$/.test(queryDate) && !Number.isNaN(new Date(`${queryDate}T12:00:00`).getTime()) ? queryDate : localDate()
  const [selected, setSelected] = useState(initialDate)
  const [month, setMonth] = useState(() => new Date(`${initialDate.slice(0, 7)}-01T12:00:00`))
  const detail = params.get('view') === 'day'
  const records = useMealStore(state => state.records)
  const dayRecords = records.filter(record => record.roomId === roomId && record.date === selected)
  const { share, notice } = useShare()
  const chooseDate = (date: string) => {
    setSelected(date)
    setParams({ view: 'day', date })
  }
  const dateLabel = new Date(`${selected}T12:00:00`).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' })
  return <MealScreen className="history-page" background={assets.history.img1}>
    <header className="history-header"><Button className="history-icon" aria-label="달력 열기" onClick={() => setParams({ date: selected })}><img src={assets.history.imgGroup} alt="" /></Button>
      <Button className="history-room" onClick={() => navigate(`/room/${roomId}`)}>덕성 멋사 뭐 먹지?<img src={assets.history.imgDashiconsArrowRightAlt2} alt="" /></Button>
      <Button className="history-icon" aria-label="기록 공유하기" onClick={() => share(`${dateLabel} 밥픽 기록: ${dayRecords.map(record => `${record.menu} · ${record.restaurant}`).join(', ') || '선택한 식사 없음'}`)}><img src={assets.history.imgBasilShareBoxOutline} alt="" /></Button></header>
    <div className="meal-card history-prompt"><div className="history-cutlery"><img src={assets.history.imgRectangle1} alt="숟가락과 포크" /></div><Divider /><p>오늘은 뭘 먹을까요?</p></div>
    <section className={`history-sheet ${detail ? 'is-detail' : ''}`} aria-label="이전 식사 기록"><Button className="history-handle" aria-label="달력 닫고 방으로 돌아가기" onClick={() => navigate(`/room/${roomId}`)} />
      <Calendar month={month} selected={selected} onMonthChange={setMonth} onSelect={chooseDate} />
      {detail && <div className="history-records"><h2>{dateLabel}</h2>{dayRecords.length ? dayRecords.map(record => <article className="meal-card history-record" key={record.id}><h3>{record.menu}</h3><p>{record.restaurant}</p></article>) : <p className="history-empty">이 날짜에는 아직 식사 기록이 없어요.</p>}</div>}
    </section><Notice>{notice}</Notice>
  </MealScreen>
}
