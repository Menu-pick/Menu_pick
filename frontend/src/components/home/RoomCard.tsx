import { Link } from 'react-router'
import chevron from '../../assets/icons/Chevron.svg'
import logoBowl from '../../assets/images/LogoBowl.svg'

export type RoomCardProps = {
  id: string
  title: string
  location: string
  participantCount: number
}

export default function RoomCard({ id, title, location, participantCount }: RoomCardProps) {
  return (
    <Link className="room-card" to={`/room/${encodeURIComponent(id)}`}>
      <span className="room-card__icon">
        <img src={logoBowl} alt="" width="30" height="35" />
      </span>
      <span className="room-card__copy">
        <strong className="room-card__title">{title}</strong>
        <span className="room-card__description">{location} · {participantCount}명 참여중</span>
      </span>
      <img className="room-card__arrow" src={chevron} alt="" width="10" height="18" />
    </Link>
  )
}
