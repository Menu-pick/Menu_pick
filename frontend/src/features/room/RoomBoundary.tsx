import { useEffect } from 'react'
import { Navigate, Outlet, useParams } from 'react-router'
import { useMealStore } from '../meal/mealStore'
import { mealOptions, useLocalRoom } from './roomStore'

export default function RoomBoundary() {
  const { roomId = '' } = useParams()
  const room = useLocalRoom(roomId)
  const meal = useMealStore(state => state.rooms[roomId])
  useEffect(() => {
    if (room && !meal) useMealStore.getState().configureRoom(roomId, mealOptions(room.settings), room.members, room.demo)
  }, [room, roomId, meal])
  if (!room) return <Navigate to="/error/e01" replace />
  if (!meal) return null
  return <Outlet key={roomId} />
}
