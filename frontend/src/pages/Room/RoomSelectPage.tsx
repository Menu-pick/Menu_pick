import { Link } from 'react-router'
import RoomSelectionLayout from './RoomSelectionLayout'

export default function RoomSelectPage() {
  return (
    <RoomSelectionLayout createLink="/home">
      <section className="room-select" aria-label="방 만들기 및 참여">
        <Link className="room-select__option" to="/room/create">방 만들기</Link>
        <Link className="room-select__option" to="/room/select/code">코드로 참여하기</Link>
      </section>
    </RoomSelectionLayout>
  )
}
