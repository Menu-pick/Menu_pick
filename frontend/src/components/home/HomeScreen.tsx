import type { ReactNode } from 'react'
import { Link } from 'react-router'
import logoBowl from '../../assets/images/LogoBowl.svg'
import logoWord from '../../assets/images/LogoWord.svg'
import characters from '../../assets/images/home-characters.png'
import RoomCard, { type RoomCardProps } from './RoomCard'
import '../../pages/Home/HomePage.css'

const rooms: RoomCardProps[] = [
  { id: '1', title: '덕성 멋사 뭐 먹지?', location: '덕성여대 근처', participantCount: 4 },
  { id: '2', title: '팀 회식 메뉴 정하기', location: '강남역 근처', participantCount: 6 },
]

type HomeScreenProps = {
  slogan: ReactNode
  createLink: string
  children?: ReactNode
  className?: string
}

export default function HomeScreen({ slogan, createLink, children, className }: HomeScreenProps) {
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
          {rooms.map((room) => (
            <li key={room.id}><RoomCard {...room} /></li>
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
