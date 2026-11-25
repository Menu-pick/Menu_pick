import { useEffect, useState, type ReactNode } from 'react'
import { Link } from 'react-router'
import logoBowl from '../../assets/images/LogoBowl.svg'
import logoWord from '../../assets/images/LogoWord.svg'
import characters from '../../assets/images/home-characters.png'
import RoomCard from './RoomCard'
import { mealErrorMessage, useMealAccess } from '../../features/meal/mealApi'
import { listRooms, type RoomResponse } from '../../features/room/roomApi'
import '../../pages/Home/HomePage.css'

type HomeScreenProps = {
  slogan?: ReactNode
  createLink?: string
  onCreate?: () => void
  createExpanded?: boolean
  showCreateRays?: boolean
  children?: ReactNode
  className?: string
}

export default function HomeScreen({
  slogan = '후보는 가볍게, 결정은 함께',
  createLink = '/room/create',
  onCreate,
  createExpanded,
  showCreateRays = true,
  children,
  className,
}: HomeScreenProps) {
  const access = useMealAccess(state => state.rooms)
  const [rooms, setRooms] = useState<RoomResponse[]>([])
  const [error, setError] = useState('')
  const [attempt, setAttempt] = useState(0)
  useEffect(() => {
    const controller = new AbortController()
    listRooms(Object.keys(access), controller.signal).then(data => {
      if (!controller.signal.aborted) {
        setRooms(data)
        setError('')
      }
    }).catch(error => {
      if (!controller.signal.aborted) setError(mealErrorMessage(error))
    })
    return () => controller.abort()
  }, [access, attempt])
  const createContent = (
    <>
      <span className="home-page__create-icon" aria-hidden="true">
        {showCreateRays && <span className="home-page__rays" />}
        <span className="home-page__plus" />
      </span>
      새로운 방 만들기
    </>
  )
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
          {rooms.map(room => (
            <li key={room.roomId}><RoomCard id={String(room.roomId)} title={room.name} location={room.placeName || room.address} participantCount={room.participantCount} /></li>
          ))}
          {error && (
            <li><p role="alert">{error}</p><button type="button" onClick={() => setAttempt(value => value + 1)}>다시 시도</button></li>
          )}
        </ul>
      </section>

      {children}

      <div className="home-page__actions">
        {onCreate ? (
          <button className="home-page__create" type="button" onClick={onCreate}
            aria-expanded={createExpanded} aria-controls="home-room-options">{createContent}</button>
        ) : (
          <Link className="home-page__create" to={createLink}>{createContent}</Link>
        )}
      </div>
    </div>
  )
}
