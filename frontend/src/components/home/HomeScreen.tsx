import type { ReactNode } from 'react'
import { Link } from 'react-router'
import logoBowl from '../../assets/images/LogoBowl.svg'
import logoWord from '../../assets/images/LogoWord.svg'
import characters from '../../assets/images/home-characters.png'
import RoomCard from './RoomCard'
import { useRoomStore } from '../../features/room/roomStore'
import '../../pages/Home/HomePage.css'

type HomeScreenProps = {
  slogan: ReactNode
  createLink: string
  children?: ReactNode
  className?: string
}

export default function HomeScreen({ slogan, createLink, children, className }: HomeScreenProps) {
  const rooms = useRoomStore(state => state.rooms)
  return (
    <div className={className ? `home-page ${className}` : 'home-page'}>
      <div className="home-page__hill" aria-hidden="true" />
      <header className="home-page__header">
        <div className="home-page__logo">
          <img src={logoWord} alt="밥픽" width="48" height="38" />
          <img src={logoBowl} alt="" width="28" height="32" />
        </div>
        <p>{slogan}</p>
      </header>

      <section className="home-page__rooms" aria-label="참여 중인 방">
        <img className="home-page__characters" src={characters} alt="" />
        <ul className="home-page__room-list">
          {Object.values(rooms).filter(room => !room.hidden).map((room) => (
            <li key={room.id}><RoomCard id={room.id} title={room.settings.name} location={room.settings.location} participantCount={room.members.length} /></li>
          ))}
        </ul>
      </section>

      {children}

      <div className="home-page__actions">
        <Link className="home-page__create" to={createLink}>
          <span className="home-page__create-icon" aria-hidden="true">
            <span className="home-page__rays" />
            <span className="home-page__plus" />
          </span>
          새로운 방 만들기
        </Link>
      </div>
    </div>
  )
}
