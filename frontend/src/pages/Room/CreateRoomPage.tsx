import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router'
import './CreateRoomPage.css'
import { useRoomStore, type RoomSettings } from '../../features/room/roomStore'

const categories = ['한식', '중식', '일식', '카페,디저트', '패스트푸드', '분식']
const mealModes = ['매장', '배달'] as const

let savedDraft: RoomSettings = { name: '', location: '', mealMode: '매장', categories: [] }

export default function CreateRoomPage() {
  const [settings, setSettings] = useState(savedDraft)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const name = settings.name.trim()
    const location = settings.location.trim()
    if (!name || name.length > 10 || !location) {
      setError('방 이름과 식사 장소를 확인해 주세요.')
      return
    }

    savedDraft = { ...settings, name, location }
    const room = useRoomStore.getState().createRoom(savedDraft)
    void navigate(`/room/${encodeURIComponent(room.id)}/waiting`, { state: { fromCreate: true } })
  }

  return (
    <div className="room-setup room-create-page">
      <header className="room-setup__header">
        <Link to="/room/select" aria-label="방 만들기 선택 화면으로 돌아가기" />
        <h1>방 만들기</h1>
      </header>
      <form onSubmit={handleSubmit}>
        <label>
          방 이름
          <input name="name" placeholder="10자입력해주세요." maxLength={10} required
            value={settings.name} onChange={(event) => setSettings({ ...settings, name: event.target.value })} />
        </label>
        <label>
          식사 장소
          <input name="location" placeholder="장소를 선택해주세요." required
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
                      categories: checked ? [...current.categories, category] : current.categories.filter((item) => item !== category),
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
