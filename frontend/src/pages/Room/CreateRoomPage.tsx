import type { FormEvent } from 'react'
import { Link } from 'react-router'
import './CreateRoomPage.css'

const categories = ['한식', '중식', '일식', '카페·디저트', '패스트푸드', '분식']

export default function CreateRoomPage() {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    // TODO: Send the room settings and selected candidate categories to the room creation API.
  }

  return (
    <div className="room-create-page">
      <header>
        <Link to="/room/select" aria-label="방 만들기 선택 화면으로 돌아가기">←</Link>
        <h1>방 만들기</h1>
      </header>
      <form onSubmit={handleSubmit}>
        <label>
          방 이름
          <input name="name" maxLength={10} required />
        </label>
        <label>
          식사 장소
          <input name="location" required />
        </label>
        <fieldset>
          <legend>식사 방식</legend>
          <div className="room-create-page__options">
            <label><input type="radio" name="mealMode" value="dine-in" required /> 매장</label>
            <label><input type="radio" name="mealMode" value="delivery" /> 배달</label>
          </div>
        </fieldset>
        <fieldset>
          <legend>음식 카테고리</legend>
          <div className="room-create-page__options">
            {categories.map((category) => (
              <label key={category}>
                <input type="checkbox" name="category" value={category} /> {category}
              </label>
            ))}
          </div>
        </fieldset>
        <button type="submit">저장</button>
      </form>
    </div>
  )
}
