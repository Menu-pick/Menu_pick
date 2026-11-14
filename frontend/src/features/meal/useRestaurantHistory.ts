import { useEffect, useState } from 'react'
import apiClient from '../../api/apiClient'
import { parseLocalDate } from './mealStore'

export type RestaurantHistoryItem = { id: number; name: string; address: string; confirmedDate?: string }

// Preserve the history API brought in from develop, while local-only demos make no requests.
export function useRestaurantHistory(roomId: string, month: Date, selected: string) {
  const enabled = Boolean(import.meta.env.VITE_API_BASE_URL) && /^\d+$/.test(roomId)
  const year = month.getFullYear()
  const monthNumber = month.getMonth() + 1
  const path = `/api/rooms/${encodeURIComponent(roomId)}/restaurants`
  const [dateState, setDateState] = useState<{ key: string; dates: string[] }>({ key: '', dates: [] })
  const [recordState, setRecordState] = useState<{ key: string; records: RestaurantHistoryItem[] }>({ key: '', records: [] })
  const [error, setError] = useState(false)
  const monthKey = `${roomId}:${year}-${monthNumber}`
  const dates = enabled && dateState.key === monthKey ? dateState.dates : []
  const recordKey = `${roomId}:${selected}`

  useEffect(() => {
    if (!enabled) return
    const controller = new AbortController()
    setError(false)
    apiClient.get<string[]>(`${path}/dates`, { params: { year, month: monthNumber }, signal: controller.signal })
      .then(({ data }) => {
        if (!controller.signal.aborted) setDateState({ key: monthKey, dates: Array.isArray(data) ? data.filter(value => Boolean(parseLocalDate(value))) : [] })
      }).catch(() => { if (!controller.signal.aborted) setError(true) })
    return () => controller.abort()
  }, [enabled, path, year, monthNumber, monthKey])

  const recorded = dates.includes(selected)
  useEffect(() => {
    if (!enabled || !recorded) return
    const controller = new AbortController()
    setError(false)
    apiClient.get<RestaurantHistoryItem[]>(path, { params: { date: selected }, signal: controller.signal })
      .then(({ data }) => { if (!controller.signal.aborted) setRecordState({ key: recordKey, records: Array.isArray(data) ? data : [] }) })
      .catch(() => { if (!controller.signal.aborted) setError(true) })
    return () => controller.abort()
  }, [enabled, recorded, path, selected, recordKey])
  return { dates, records: enabled && recorded && recordState.key === recordKey ? recordState.records : [], error: enabled && error }
}
