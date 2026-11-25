import { useEffect } from 'react'
import { useNavigate } from 'react-router'
import { loadApiRoom, loadMyVotes, loadResult, loadSession, mealErrorCode } from './mealApi'

// Poll sequentially; cancel on navigation so a previous room cannot overwrite the UI.
export function useMealPolling(roomId: string, enabled: boolean, syncMyVotes = false) {
  const navigate = useNavigate()
  useEffect(() => {
    if (!enabled) return
    const controller = new AbortController()
    let timer: ReturnType<typeof setTimeout>
    const tick = async () => {
      try {
        await loadSession(roomId, false, controller.signal)
        await loadApiRoom(roomId, controller.signal)
        if (syncMyVotes) await loadMyVotes(roomId, controller.signal)
        await loadResult(roomId, controller.signal)
      } catch (error) {
        if (!controller.signal.aborted) {
          const code = mealErrorCode(error)
          navigate(`/error/${code}`, { state: { returnTo: code === 'e02' ? '/room/select/code' : window.location.pathname + window.location.search } })
        }
      }
      if (!controller.signal.aborted) timer = setTimeout(tick, 3000)
    }
    timer = setTimeout(tick, 3000)
    return () => { controller.abort(); clearTimeout(timer) }
  }, [roomId, enabled, syncMyVotes, navigate])
}
