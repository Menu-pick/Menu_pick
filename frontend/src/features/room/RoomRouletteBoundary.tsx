import { useEffect, useState } from 'react'
import { Navigate, Outlet, useNavigate, useParams } from 'react-router'
import axios from 'axios'
import { isApiRoom, loadSession, mealErrorCode } from '../meal/mealApi'
import { MealScreen } from '../meal/MealUI'

// Room actions start the session. Entering or refreshing roulette only reads it.
export default function RoomRouletteBoundary() {
  const { roomId = '' } = useParams()
  if (!isApiRoom(roomId)) return <Outlet />
  return <ServerRoulette key={roomId} roomId={roomId} />
}

function ServerRoulette({ roomId }: { roomId: string }) {
  const navigate = useNavigate()
  const [status, setStatus] = useState<'loading' | 'ready' | 'missing'>('loading')
  useEffect(() => {
    const controller = new AbortController()
    loadSession(roomId, false, controller.signal).then(() => {
      if (!controller.signal.aborted) setStatus('ready')
    }).catch(error => {
      if (controller.signal.aborted) return
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        setStatus('missing')
        return
      }
      void navigate(`/error/${mealErrorCode(error)}`, { replace: true, state: { returnTo: `/room/${roomId}/roulette` } })
    })
    return () => controller.abort()
  }, [navigate, roomId])
  if (status === 'missing') return <Navigate to={`/room/${roomId}/waiting`} replace />
  if (status === 'loading') return <MealScreen><p role="status">식사 정보를 불러오고 있어요.</p></MealScreen>
  return <Outlet />
}
