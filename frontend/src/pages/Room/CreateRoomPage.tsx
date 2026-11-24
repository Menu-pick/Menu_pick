import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router'
import './CreateRoomPage.css'
import type { RoomSettings } from '../../features/room/roomStore'
import { categories, createRoom, type RoomPlace } from '../../features/room/roomApi'
import RoomPlaceInput from '../../features/room/RoomPlaceInput'
import { useRoomRequest } from '../../features/room/useRoomRequest'
import { mealErrorCode, mealErrorMessage } from '../../features/meal/mealApi'

const mealModes = ['매장', '배달'] as const

let savedDraft: RoomSettings = { name: '', location: '', mealMode: '매장', categories: [] }
let savedNickname = ''
let savedPlace: RoomPlace | null = null

export default function CreateRoomPage() {
  const [settings, setSettings] = useState(savedDraft)
  const [nickname, setNickname] = useState(savedNickname)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const [place, setPlace] = useState(savedPlace)
  const { pending, run } = useRoomRequest()

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const name = settings.name.trim()
    const location = settings.location.trim()
    const memberName = nickname.trim()
    if (!name || name.length > 10 || !location) {
      setError('방 이름과 식사 장소를 확인해 주세요.')
      return
    }
    if (!memberName) {
      setError('내 닉네임을 입력해 주세요.')
      return
    }

    if (memberName.length > 10 || !place || !settings.categories.length) {
      setError(memberName.length > 10 ? '닉네임은 10자 이내로 입력해주세요.' :
        !place ? '검색 결과에서 식사 장소를 선택해주세요.' : '음식 카테고리를 하나 이상 선택해주세요.')
      return
    }

    void run(async () => {
      savedDraft = { ...settings, name, location }
      savedNickname = memberName
      savedPlace = place
      setError('')
      try {
        const room = await createRoom(savedDraft, place, memberName)
        void navigate(`/room/${room.roomId}/waiting`, { state: { fromCreate: true } })
      } catch (error) {
        if (mealErrorCode(error) === 'e06') void navigate('/error/e06', { state: { returnTo: '/room/create' } })
        else setError(mealErrorMessage(error))
      }
    })
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
          내 닉네임
          <input name="nickname" placeholder="참여할 닉네임을 입력해주세요." autoComplete="nickname" maxLength={10} required
            value={nickname} onChange={(event) => setNickname(event.target.value)} />
        </label>
        <RoomPlaceInput value={settings.location} place={place}
          onChange={location => { setPlace(null); setSettings({ ...settings, location }) }}
          onSelect={choice => { setPlace(choice); setSettings({ ...settings, location: choice.name }) }} />
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
          <button className="room-setup__primary" type="submit" disabled={pending}>변경사항 저장</button>
        </div>
      </form>
    </div>
  )
}
