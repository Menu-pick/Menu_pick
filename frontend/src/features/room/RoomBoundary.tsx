import { useEffect } from 'react'
import { Navigate, Outlet, useParams } from 'react-router'
import { useMealStore } from '../meal/mealStore'
import { mealOptions, useLocalRoom } from './roomStore'
import { isApiRoom } from '../meal/mealApi'
import { ApiRoomBoundary } from '../meal/MealApiBoundary'

export default function RoomBoundary() {
  const { roomId = '' } = useParams()
  const room = useLocalRoom(roomId)
  const meal = useMealStore(state => state.rooms[roomId])
  const remote = isApiRoom(roomId)
  useEffect(() => {
    if (!remote && room && !meal) useMealStore.getState().configureRoom(roomId, mealOptions(room.settings), room.members, room.demo)
  }, [room, roomId, meal, remote])
  if (remote) return <ApiRoomBoundary />
  if (!room) return <Navigate to="/error/e01" replace />
  if (!meal) return null
  return <Outlet key={roomId} />
}
