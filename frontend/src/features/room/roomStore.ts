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

function members(count: number, nickname = '박채희'): Participant[] {
  return Array.from({ length: count }, (_, index) => ({
    id: `member-${index + 1}`, name: index === 0 ? nickname : '박채희', image: assets.result.imgEllipse7,
  }))
}
const initialRooms: Record<string, LocalRoom> = {
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
  saveSettings: (roomId: string, settings: RoomSettings) => void
  beginMeal: (roomId: string) => 'ok' | 'missing' | 'waiting' | 'unavailable'
}

// Shared room cache with local fixtures for preview routes.
export const useRoomStore = create<RoomState>()(persist((set, get) => ({
  rooms: initialRooms,
  saveSettings: (roomId, settings) => {
    const room = get().rooms[roomId]
    if (!room) return
    set(state => ({ rooms: { ...state.rooms, [roomId]: { ...room, settings } } }))
    // A running meal keeps its options; changed room settings apply to the next session.
    const meal = useMealStore.getState()
    if (!meal.rooms[roomId]?.started || meal.rooms[roomId]?.completedRecordId) meal.configureRoom(roomId, mealOptions(settings))
  },
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
