import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router'
import cancel from '../../assets/icons/iconoir_xmark-circle.svg'
import check from '../../assets/icons/akar-icons_circle-check.svg'
import { getRoomSettings, RoomTitle, savedRoomSettings } from './ExistingRoom'
import './CreateRoomPage.css'
import './ExistingRoom.css'

const categories = ['한식', '중식', '일식', '카페,디저트', '패스트푸드', '분식']
const mealModes = ['매장', '배달'] as const

export default function RoomSettingsPage() {
  const { roomId = '' } = useParams()
  return <RoomSettingsForm key={roomId} roomId={roomId} />
}

function RoomSettingsForm({ roomId }: { roomId: string }) {
  const [settings, setSettings] = useState(() => getRoomSettings(roomId))
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
    savedRoomSettings.set(roomId, updatedSettings)
    if (state?.startMeal === true) {
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
          <button type="submit" aria-label="변경사항 저장"><img src={check} alt="" /></button>
        </header>
        <label>
          방 이름
          <input name="name" placeholder="10자입력해주세요." maxLength={10}
            value={settings.name} onChange={(event) => setSettings({ ...settings, name: event.target.value })} />
        </label>
        <label>
          식사 장소
          <input name="location" placeholder="장소를 선택해주세요."
            value={settings.location} onChange={(event) => setSettings({ ...settings, location: event.target.value })} />
        </label>
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
          <button className="room-setup__primary" type="submit">변경사항 저장</button>
        </div>
      </form>
    </div>
  )
}
