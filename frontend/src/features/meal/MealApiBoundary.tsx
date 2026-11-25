import { useEffect, useState } from 'react'
import { Outlet, useLocation, useNavigate, useParams } from 'react-router'
import axios from 'axios'
import { loadApiRoom, loadSession, loadMyVotes, loadResult, isApiRoom, mealErrorCode } from './mealApi'
import { MealScreen } from './MealUI'

export function ApiRoomBoundary() {
  const { roomId = '' } = useParams()
  const navigate = useNavigate()
  const [loaded, setLoaded] = useState('')
  useEffect(() => {
    const controller = new AbortController()
    loadApiRoom(roomId, controller.signal).then(() => {
      if (!controller.signal.aborted) setLoaded(roomId)
    }).catch(error => {
      if (!controller.signal.aborted) navigate(`/error/${mealErrorCode(error)}`, { replace: true, state: { returnTo: `/room/${roomId}` } })
    })
    return () => controller.abort()
  }, [roomId, navigate])
  if (loaded !== roomId) return <MealScreen><p role="status">방 정보를 불러오고 있어요.</p></MealScreen>
  return <Outlet key={roomId} />
}

// Server-backed pages hydrate before rendering, including after a hard refresh.
export default function MealApiBoundary() {
  const { roomId = '' } = useParams()
  const { pathname, search } = useLocation()
  const navigate = useNavigate()
  const key = `${roomId}:${pathname}`
  const [loaded, setLoaded] = useState('')
  const remote = isApiRoom(roomId)
  useEffect(() => {
    if (!remote) return
    const controller = new AbortController()
    const voting = pathname.endsWith('/vote')
    const result = pathname.includes('/result')
    const draw = pathname.endsWith('/roulette')
    async function load() {
      await loadSession(roomId, draw, controller.signal)
      if (voting) await loadMyVotes(roomId, controller.signal)
      if (voting || result) await loadResult(roomId, controller.signal)
      if (!controller.signal.aborted) setLoaded(key)
    }
    load().catch(error => {
      if (controller.signal.aborted) return
      if (axios.isAxiosError(error) && error.response?.status === 404 && !draw) {
        navigate(`/room/${roomId}/roulette`, { replace: true }); return
      }
      const code = mealErrorCode(error)
      navigate(`/error/${code}`, { replace: true, state: { returnTo: code === 'e02' ? '/room/select/code' : `${pathname}${search}` } })
    })
    return () => controller.abort()
  }, [remote, roomId, pathname, key, navigate])
  if (remote && loaded !== key) return <MealScreen><p role="status">식사 정보를 불러오고 있어요.</p></MealScreen>
  return <Outlet />
}
