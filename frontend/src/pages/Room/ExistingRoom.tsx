import { Link } from 'react-router'
import chevron from '../../assets/icons/Chevron.svg'

export type RoomSettings = {
  name: string
  location: string
  mealMode: '매장' | '배달'
  categories: string[]
}

// TODO: Replace the per-room mock settings with the room API.
export const savedRoomSettings = new Map<string, RoomSettings>()

export function getRoomSettings(roomId: string): RoomSettings {
  return savedRoomSettings.get(roomId) ?? {
    name: roomId === '2' ? '팀 회식 메뉴 정하기' : '덕성 멋사 뭐 먹지?',
    location: '',
    mealMode: '매장',
    categories: [],
  }
}

export function RoomTitle({ name, to }: { name: string; to: string }) {
  return (
    <Link className="existing-room__title" to={to}>
      <span>{name}</span>
      <img src={chevron} alt="" width="8" height="14" />
    </Link>
  )
}
