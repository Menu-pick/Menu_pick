import { useEffect, useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router'
import cancel from '../../assets/icons/iconoir_xmark-circle.svg'
import check from '../../assets/icons/akar-icons_circle-check.svg'
import { getRoomSettings, RoomTitle } from './ExistingRoom'
import { useRoomStore } from '../../features/room/roomStore'
import { isApiRoom, mealErrorCode, mealErrorMessage, useMealAccess } from '../../features/meal/mealApi'
import { MealScreen } from '../../features/meal/MealUI'
import { categories, getRoom, roomPlace, roomSettings, updateRoom, type RoomResponse } from '../../features/room/roomApi'
import RoomPlaceInput from '../../features/room/RoomPlaceInput'
import { startRoomMeal } from '../../features/room/startRoomMeal'
import { useRoomRequest } from '../../features/room/useRoomRequest'
import './CreateRoomPage.css'
import './ExistingRoom.css'

const mealModes = ['매장', '배달'] as const

export default function RoomSettingsPage() {
  const { roomId = '' } = useParams()
  if (isApiRoom(roomId)) return <ServerSettings key={roomId} roomId={roomId} />
  return <RoomSettingsForm key={roomId} roomId={roomId} />
}

function ServerSettings({ roomId }: { roomId: string }) {
  const [room, setRoom] = useState<RoomResponse>()
  const navigate = useNavigate()
  const { state } = useLocation()
  useEffect(() => {
    const controller = new AbortController()
    getRoom(roomId, controller.signal).then(data => {
      if (!controller.signal.aborted) setRoom(data)
    }).catch(error => {
      if (controller.signal.aborted) return
      const code = mealErrorCode(error)
      void navigate(`/error/${code}`, { replace: true, state: {
        returnTo: code === 'e01' ? '/home' : `/room/${roomId}/settings`,
        returnState: state,
      } })
    })
    return () => controller.abort()
  }, [roomId, navigate, state])
  if (!room) return <MealScreen><p role="status">방 설정을 불러오고 있어요.</p></MealScreen>
  return <RoomSettingsForm roomId={roomId} serverRoom={room} />
}

function RoomSettingsForm({ roomId, serverRoom }: { roomId: string; serverRoom?: RoomResponse }) {
  const [settings, setSettings] = useState(() => serverRoom ? roomSettings(serverRoom) : getRoomSettings(roomId))
  const [place, setPlace] = useState(() => serverRoom ? roomPlace(serverRoom) : null)
  const { pending, run } = useRoomRequest()
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const { state } = useLocation()
  const base = `/room/${encodeURIComponent(roomId)}`

  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const name = settings.name.trim()
    const location = settings.location.trim()
    if (!name || !location) {
      setError('방 이름과 식사 장소를 입력해 주세요.')
      return
    }
    const updatedSettings = { ...settings, name, location }
    if (serverRoom) {
      const access = useMealAccess.getState().rooms[roomId]
      const code = serverRoom.code
      const joinLink = `/room/select/code?code=${encodeURIComponent(code)}`
      if (!access) {
        void navigate('/error/e02', { state: { returnTo: joinLink } })
        return
      }
      if (!place || !settings.categories.length) {
        setError(!place ? '검색 결과에서 식사 장소를 선택해주세요.' : '음식 카테고리를 하나 이상 선택해주세요.')
        return
      }
      void run(async () => {
        setError('')
        try {
          await updateRoom(roomId, updatedSettings, place, access.nickname, access.participantToken)
          if (state?.startMeal === true) {
            await startRoomMeal(roomId)
            void navigate(`${base}/roulette`, { replace: true })
          } else {
            void navigate(base, { replace: true })
          }
        } catch (error) {
          const failure = mealErrorCode(error)
          if (failure === 'e07') setError(mealErrorMessage(error))
          else void navigate(`/error/${failure}`, { state: {
            roomCode: code,
            returnTo: failure === 'e02' ? joinLink : failure === 'e01' ? '/home' : `${base}/settings`,
            returnState: failure === 'e06' ? state : undefined,
          } })
        }
      })
      return
    }
    useRoomStore.getState().saveSettings(roomId, updatedSettings)
    if (state?.startMeal === true) {
      const result = useRoomStore.getState().beginMeal(roomId)
      if (result !== 'ok') {
        void navigate(result === 'waiting' ? '/error/e03' : '/error/e07', { state: { returnTo: `${base}/settings`, returnState: { startMeal: true }, roomCode: useRoomStore.getState().rooms[roomId]?.code } })
        return
      }
      void navigate(`${base}/roulette`, {
        replace: true,
        state: { existingRoomSettings: updatedSettings },
      })
      return
    }
    void navigate(base, { replace: true })
  }

  return (
    <div className="room-setup room-create-page existing-room">
      <form className="existing-room__form" onSubmit={save}>
        <header className="existing-room__header">
          <Link to={base} aria-label="설정 변경 취소"><img src={cancel} alt="" /></Link>
          <RoomTitle name={getRoomSettings(roomId).name} to={base} />
          <button type="submit" disabled={pending} aria-label="변경사항 저장"><img src={check} alt="" /></button>
        </header>
        <label>
          방 이름
          <input name="name" placeholder="10자입력해주세요." maxLength={10}
            value={settings.name} onChange={(event) => setSettings({ ...settings, name: event.target.value })} />
        </label>
        {serverRoom ? (
          <RoomPlaceInput value={settings.location} place={place}
            onChange={location => { setPlace(null); setSettings({ ...settings, location }) }}
            onSelect={choice => { setPlace(choice); setSettings({ ...settings, location: choice.name }) }} />
        ) : (
          <label>
            식사 장소
            <input name="location" placeholder="장소를 선택해주세요."
              value={settings.location} onChange={event => setSettings({ ...settings, location: event.target.value })} />
          </label>
        )}
        <fieldset>
          <legend>식사 방식</legend>
          <div className="room-create-page__options">
            {mealModes.map((mode) => (
              <label key={mode}>
                <input type="radio" name="mealMode" checked={settings.mealMode === mode}
                  onChange={() => setSettings({ ...settings, mealMode: mode })} />
                {mode}
              </label>
            ))}
          </div>
        </fieldset>
        <fieldset>
          <legend>음식 카테고리</legend>
          <div className="room-create-page__options room-create-page__categories">
            {categories.map((category) => (
              <label key={category}>
                <input type="checkbox" name="category" checked={settings.categories.includes(category)}
                  onChange={(event) => {
                    const checked = event.target.checked
                    setSettings((current) => ({
                      ...current,
                      categories: checked
                        ? [...current.categories, category]
                        : current.categories.filter((item) => item !== category),
                    }))
                  }} />
                {category}
              </label>
            ))}
          </div>
        </fieldset>
        <div className="room-setup__footer">
          {error && <p role="alert">{error}</p>}
          <button className="room-setup__primary" type="submit" disabled={pending}>변경사항 저장</button>
        </div>
      </form>
    </div>
  )
}
