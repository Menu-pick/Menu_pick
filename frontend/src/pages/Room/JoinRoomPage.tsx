import { Navigate, useLocation } from 'react-router'

// Keep old invitation links working with the implemented code-entry screen.
export default function JoinRoomPage() {
  const { search } = useLocation()
  return <Navigate to={`/room/select/code${search}`} replace />
}
