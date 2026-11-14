import HomeScreen from '../../components/home/HomeScreen'
import { Navigate } from 'react-router'
import { useRoomStore } from '../../features/room/roomStore'

export default function HomePage() {
  const rooms = useRoomStore(state => state.rooms)
  if (!Object.values(rooms).some(room => !room.hidden)) return <Navigate to="/error/e01" replace />
  return <HomeScreen slogan="후보는 가볍게, 결정은 함께" createLink="/room/select" />
}
