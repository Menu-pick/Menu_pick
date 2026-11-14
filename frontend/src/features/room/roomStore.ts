import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { assets } from '../meal/assets'
import { useMealStore, type Participant } from '../meal/mealStore'

export type RoomSettings = {
  name: string
  location: string
  mealMode: '매장' | '배달'
  categories: string[]
}
export type LocalRoom = {
  id: string
  code: string
  settings: RoomSettings
  members: Participant[]
  currentParticipantId: string
  demo: boolean
  hidden?: boolean
}

function members(count: number): Participant[] {
  return Array.from({ length: count }, (_, index) => ({
    id: `member-${index + 1}`, name: '박채희', image: assets.result.imgEllipse7,
  }))
}
const initialRooms: Record<string, LocalRoom> = {
  '1': { id: '1', code: 'B4P1K', settings: { name: '덕성 멋사 뭐 먹지?', location: '덕성여대 근처', mealMode: '매장', categories: [] }, members: members(4), currentParticipantId: 'member-1', demo: true },
  '2': { id: '2', code: 'TEAM02', settings: { name: '팀 회식 메뉴 정하기', location: '강남역 근처', mealMode: '매장', categories: [] }, members: members(6), currentParticipantId: 'member-1', demo: true },
  demo: { id: 'demo', code: 'DEMO01', settings: { name: '덕성 멋사 뭐 먹지?', location: '덕성여대 근처', mealMode: '매장', categories: [] }, members: members(4), currentParticipantId: 'member-1', demo: true, hidden: true },
}

export function mealOptions(settings: RoomSettings) {
  return { name: settings.name, location: settings.location,
    categories: settings.categories.length ? settings.categories : ['전체'],
    mode: settings.mealMode === '배달' ? 'delivery' as const : 'restaurant' as const,
  }
}

type RoomState = {
  rooms: Record<string, LocalRoom>
  createRoom: (settings: RoomSettings) => LocalRoom
  saveSettings: (roomId: string, settings: RoomSettings) => void
  joinByCode: (code: string) => LocalRoom | undefined
  beginMeal: (roomId: string) => 'ok' | 'missing' | 'waiting' | 'unavailable'
}

// Local demonstration only. Replace room creation/join and mock members when the room API exists.
export const useRoomStore = create<RoomState>()(persist((set, get) => ({
  rooms: initialRooms,
  createRoom: settings => {
    const id = crypto.randomUUID()
    let code: string
    do {
      code = Array.from(crypto.getRandomValues(new Uint8Array(6)), value => 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[value % 32]).join('')
    } while (Object.values(get().rooms).some(room => room.code === code))
    const room: LocalRoom = { id, code, settings, members: members(4), currentParticipantId: 'member-1', demo: true }
    set(state => ({ rooms: { ...state.rooms, [id]: room } }))
    useMealStore.getState().configureRoom(id, mealOptions(settings), room.members, room.demo)
    return room
  },
  saveSettings: (roomId, settings) => {
    const room = get().rooms[roomId]
    if (!room) return
    set(state => ({ rooms: { ...state.rooms, [roomId]: { ...room, settings } } }))
    // A running meal keeps its options; changed room settings apply to the next session.
    const meal = useMealStore.getState()
    if (!meal.rooms[roomId]?.started || meal.rooms[roomId]?.completedRecordId) meal.configureRoom(roomId, mealOptions(settings))
  },
  joinByCode: code => Object.values(get().rooms).find(room => room.code === code.trim().toUpperCase()),
  beginMeal: roomId => {
    const room = get().rooms[roomId]
    if (!room) return 'missing'
    if (room.members.length < 2) return 'waiting'
    const meal = useMealStore.getState()
    meal.configureRoom(roomId, mealOptions(room.settings), room.members, room.demo)
    meal.setCurrentParticipant(roomId, room.currentParticipantId)
    return meal.startMeal(roomId, true) ? 'ok' : 'unavailable'
  },
}), { name: 'bappick-rooms', version: 1 }))

export function useLocalRoom(roomId: string) {
  return useRoomStore(state => state.rooms[roomId])
}
