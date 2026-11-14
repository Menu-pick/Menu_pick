import { BrowserRouter, Route, Routes } from 'react-router'
import SplashPage from '../pages/Splash/SplashPage'
import HomePage from '../pages/Home/HomePage'
import RoomSelectPage from '../pages/Room/RoomSelectPage'
import RoomCodePage from '../pages/Room/RoomCodePage'
import CreateRoomPage from '../pages/Room/CreateRoomPage'
import JoinRoomPage from '../pages/Room/JoinRoomPage'
import WaitingRoomPage from '../pages/Room/WaitingRoomPage'
import RoomDetailPage from '../pages/Room/RoomDetailPage'
import RoomSettingsPage from '../pages/Room/RoomSettingsPage'
import RoulettePage from '../pages/Vote/RoulettePage'
import VotingPage from '../pages/Vote/VotingPage'
import VoteResultPage from '../pages/Vote/VoteResultPage'
import SelectionCompletePage from '../pages/Complete/SelectionCompletePage'
import HistoryPage from '../pages/History/HistoryPage'
import ErrorPage from '../pages/Error/ErrorPage'

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SplashPage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/room/select" element={<RoomSelectPage />} />
        <Route path="/room/select/code" element={<RoomCodePage />} />
        <Route path="/room/create" element={<CreateRoomPage />} />
        <Route path="/room/join" element={<JoinRoomPage />} />
        <Route path="/room/:roomId/waiting" element={<WaitingRoomPage />} />
        <Route path="/room/:roomId" element={<RoomDetailPage />} />
        <Route path="/room/:roomId/settings" element={<RoomSettingsPage />} />
        <Route path="/room/:roomId/roulette" element={<RoulettePage />} />
        <Route path="/room/:roomId/vote" element={<VotingPage />} />
        <Route path="/room/:roomId/result" element={<VoteResultPage />} />
        <Route path="/room/:roomId/complete" element={<SelectionCompletePage />} />
        <Route path="/room/:roomId/history" element={<HistoryPage />} />
        <Route path="/error/:code" element={<ErrorPage />} />
        <Route path="*" element={<ErrorPage />} />
      </Routes>
    </BrowserRouter>
  )
}
