import Button from '../../components/common/Button'
import { localDate } from './mealStore'

const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
// The Figma calendar snippet has no import/source mapping or installed counterpart.
// Native controls preserve the design without introducing a second component library.
export default function Calendar({ month, selected, recordedDates = [], onMonthChange, onSelect }: {
  month: Date; selected: string; recordedDates?: string[]; onMonthChange: (date: Date) => void; onSelect: (date: string) => void
}) {
  const year = month.getFullYear()
  const monthIndex = month.getMonth()
  const firstWeekday = new Date(year, monthIndex, 1).getDay()
  const dayCount = new Date(year, monthIndex + 1, 0).getDate()
  const cellCount = Math.ceil((firstWeekday + dayCount) / 7) * 7
  const selectedYear = Number(selected.slice(0, 4))
  const years = Array.from({ length: 21 }, (_, index) => selectedYear - 10 + index)
  return <div className="meal-calendar">
    <div className="calendar-navigation"><Button className="calendar-arrow" aria-label="이전 달" onClick={() => onMonthChange(new Date(year, monthIndex - 1, 1))}>‹</Button>
      <div className="calendar-selects"><select aria-label="월" value={monthIndex} onChange={event => onMonthChange(new Date(year, Number(event.target.value), 1))}>{monthNames.map((name, index) => <option key={name} value={index}>{name}</option>)}</select>
        <select aria-label="연도" value={year} onChange={event => onMonthChange(new Date(Number(event.target.value), monthIndex, 1))}>{Array.from(new Set([...years, year])).sort((a, b) => a - b).map(value => <option key={value}>{value}</option>)}</select></div>
      <Button className="calendar-arrow" aria-label="다음 달" onClick={() => onMonthChange(new Date(year, monthIndex + 1, 1))}>›</Button></div>
    <div className="calendar-grid"><div className="calendar-weekdays">{['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => <span key={day}>{day}</span>)}</div>
      <div className="calendar-days">{Array.from({ length: cellCount }, (_, index) => {
        const day = index - firstWeekday + 1
        const date = new Date(year, monthIndex, day)
        const key = localDate(date)
        const outside = day < 1 || day > dayCount
        const recorded = recordedDates.includes(key)
        return <Button key={key} className={`calendar-day ${selected === key ? 'is-selected' : ''} ${outside ? 'is-outside' : ''}`}
          aria-label={`${date.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}${recorded ? ', 식사 기록 있음' : ''}`} aria-pressed={selected === key} data-has-record={recorded || undefined}
          onClick={() => { if (outside) onMonthChange(new Date(date.getFullYear(), date.getMonth(), 1)); onSelect(key) }}>{date.getDate()}</Button>
      })}</div></div>
  </div>
}
