import { useEffect, useState } from 'react'
import { mealErrorMessage } from '../meal/mealApi'
import { searchPlaces, type RoomPlace } from './roomApi'

export default function RoomPlaceInput({ value, place, onChange, onSelect }: {
  value: string
  place: RoomPlace | null
  onChange: (value: string) => void
  onSelect: (place: RoomPlace) => void
}) {
  const [result, setResult] = useState<{ query: string; places: RoomPlace[]; message: string }>()
  const query = value.trim()
  useEffect(() => {
    if (place || !query) return
    const controller = new AbortController()
    const timer = window.setTimeout(async () => {
      try {
        const places = await searchPlaces(query, controller.signal)
        if (!controller.signal.aborted) setResult({ query, places, message: places.length ? '' : '검색 결과가 없어요.' })
      } catch (error) {
        if (!controller.signal.aborted) setResult({ query, places: [], message: mealErrorMessage(error) })
      }
    }, 350)
    return () => { window.clearTimeout(timer); controller.abort() }
  }, [place, query])

  const visible = !place && query && result?.query === query ? result : undefined
  return (
    <>
      <label>
        식사 장소
        <input name="location" placeholder="장소를 선택해주세요." required autoComplete="off"
          value={value} onChange={event => onChange(event.target.value)} />
      </label>
      {visible?.message && <p role="status">{visible.message}</p>}
      {visible && visible.places.length > 0 && (
        <ul aria-label="식사 장소 검색 결과">
          {visible.places.map(item => (
            <li key={item.placeId}>
              <button type="button" onClick={() => onSelect(item)}>{item.name} · {item.address}</button>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}
