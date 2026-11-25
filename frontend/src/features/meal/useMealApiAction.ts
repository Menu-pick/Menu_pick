import { useCallback, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { mealErrorCode, mealErrorMessage } from './mealApi'
import { useMealRoom } from './MealUI'

export function useMealApiAction() {
  const roomId = useMealRoom()
  const navigate = useNavigate()
  const location = useLocation()
  const busy = useRef(false)
  const [pending, setPending] = useState(false)
  const [message, setMessage] = useState('')
  const run = useCallback(async (action: () => Promise<void>) => {
    if (busy.current) return
    busy.current = true
    setPending(true)
    setMessage('')
    try { await action() }
    catch (error) {
      const code = mealErrorCode(error)
      if (code === 'tie') navigate(`/room/${roomId}/result/tie`, { replace: true })
      else if (code === 'e07') setMessage(mealErrorMessage(error))
      else navigate(`/error/${code}`, { state: { returnTo: code === 'e02' ? '/room/select/code' : code === 'e04' ? `/room/${roomId}/vote` : `${location.pathname}${location.search}` } })
    } finally { busy.current = false; setPending(false) }
  }, [navigate, roomId, location.pathname, location.search])
  return { run, pending, message }
}
