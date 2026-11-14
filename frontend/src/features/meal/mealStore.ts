import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { assets } from './assets'

export type MealMode = 'restaurant' | 'delivery'
export type Choice = 'like' | 'dislike'
export type Menu = { id: string; name: string; image: string; categories: string[] }
export type Participant = { id: string; name: string; image: string }
export type RoomOptions = { name: string; categories: string[]; mode: MealMode; location: string }
export type Restaurant = { id: string; name: string; monogram: string; distance: string; meters: number; menuIds: string[]; location: string; mapUrl: string }
export type MealRecord = {
  id: string; sessionId: string; roomId: string; date: string; menuId: string;
  menu: string; restaurantId?: string; restaurant: string; mode: MealMode;
}
export type RoomMeal = {
  sessionId: string; started: boolean; demo: boolean; options: RoomOptions; candidates: Menu[];
  participants: Participant[]; currentParticipantId: string;
  ballots: Record<string, Record<string, Choice>>; restaurantId: string;
  completedRecordId?: string;
}

// Local fixtures; room integration can supply its own catalog and participants.
export const menus: Menu[] = [
  { id: 'pho', name: '쌀국수', image: assets.vote.imgUnsplashAoMYg6Qnedu, categories: ['아시안', '면류'] },
  { id: 'mala', name: '마라탕', image: assets.vote.imgRectangle24, categories: ['중식', '면류'] },
  { id: 'noodles', name: '칼국수', image: assets.vote.imgRectangle28, categories: ['한식', '면류'] },
]
export const restaurants: Restaurant[] = [
  { id: 'mibundang', name: '미분당', monogram: '미', distance: '도보 4분 · 280m', meters: 280, menuIds: ['pho'], location: '덕성여대 근처', mapUrl: 'https://map.naver.com/p/search/미분당%20덕성여대' },
  { id: 'popo', name: '포포쌀국수', monogram: '포', distance: '도보 6분 · 450m', meters: 450, menuIds: ['pho'], location: '덕성여대 근처', mapUrl: 'https://map.naver.com/p/search/포포쌀국수%20덕성여대' },
  { id: 'saigon', name: '사이공포', monogram: '사', distance: '도보 8분 · 650m', meters: 650, menuIds: ['pho'], location: '덕성여대 근처', mapUrl: 'https://map.naver.com/p/search/사이공포%20덕성여대' },
]
const defaultOptions: RoomOptions = { name: '덕성 멋사 뭐 먹지?', categories: ['전체'], mode: 'restaurant', location: '덕성여대 근처' }
const demoParticipants: Participant[] = Array.from({ length: 4 }, (_, index) => ({ id: `member-${index + 1}`, name: '박채희', image: assets.result.imgEllipse7 }))
const demoBallots: RoomMeal['ballots'] = {
  'member-2': { pho: 'like', mala: 'like', noodles: 'like' },
  'member-3': { pho: 'like', mala: 'like', noodles: 'dislike' },
  'member-4': { pho: 'like', mala: 'dislike', noodles: 'dislike' },
}
const emptyRoom: RoomMeal = {
  sessionId: 'preview', started: false, demo: true, options: defaultOptions, candidates: menus,
  participants: demoParticipants, currentParticipantId: demoParticipants[0].id,
  ballots: demoBallots, restaurantId: restaurants[0].id,
}

export function localDate(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}
export function parseLocalDate(value: string | null) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return undefined
  const date = new Date(`${value}T12:00:00`)
  return !Number.isNaN(date.getTime()) && localDate(date) === value ? date : undefined
}
export function currentVotes(room: RoomMeal) {
  return room.ballots[room.currentParticipantId] ?? {}
}
export function hasVoted(room: RoomMeal, participantId = room.currentParticipantId) {
  return room.candidates.length > 0 && room.candidates.every(menu => ['like', 'dislike'].includes(room.ballots[participantId]?.[menu.id]))
}
export function allVotesComplete(room: RoomMeal) {
  return room.participants.length > 0 && room.participants.every(member => hasVoted(room, member.id))
}
export function rankedMenus(room: RoomMeal) {
  return room.candidates.map(menu => ({ ...menu, count: room.participants.filter(member => room.ballots[member.id]?.[menu.id] === 'like').length }))
    .sort((a, b) => b.count - a.count)
}
export function uniqueWinner(room: RoomMeal) {
  const ranking = rankedMenus(room)
  return ranking[0] && (!ranking[1] || ranking[0].count > ranking[1].count) ? ranking[0] : undefined
}
export function restaurantRecommendations(room: RoomMeal, catalog: Restaurant[] = restaurants) {
  const winner = uniqueWinner(room)
  const matches = winner ? catalog.filter(item => item.menuIds.includes(winner.id) && item.location === room.options.location).sort((a, b) => a.meters - b.meters) : []
  if (matches.length > 0) return { items: matches, preview: false }
  // Keep the Figma restaurant screen available before the recommendation API is connected.
  if (room.demo || !import.meta.env.VITE_API_BASE_URL) return { items: [...restaurants].sort((a, b) => a.meters - b.meters), preview: true }
  return { items: [], preview: false }
}
export function recommendedRestaurants(room: RoomMeal, catalog: Restaurant[] = restaurants) {
  return restaurantRecommendations(room, catalog).items
}
function pickCandidates(catalog: Menu[], categories: string[]) {
  const pool = [...new Map(catalog.filter(menu => categories.length === 0 || categories.includes('전체') || menu.categories.some(category => categories.includes(category))).map(menu => [menu.id, menu])).values()]
  for (let index = pool.length - 1; index > 0; index--) {
    const other = Math.floor(Math.random() * (index + 1))
    ;[pool[index], pool[other]] = [pool[other], pool[index]]
  }
  return pool.length >= 3 ? pool.slice(0, 3) : []
}

type MealState = {
  rooms: Record<string, RoomMeal>; records: MealRecord[];
  menuCatalog: Menu[]; restaurantCatalog: Restaurant[];
  configureRoom: (roomId: string, options: Partial<RoomOptions>, participants?: Participant[], demo?: boolean) => void;
  setCatalog: (menus: Menu[], restaurants: Restaurant[]) => void;
  startMeal: (roomId: string, forceNew?: boolean) => boolean;
  setCurrentParticipant: (roomId: string, participantId: string) => void;
  vote: (roomId: string, menuId: string, choice: Choice) => void;
  selectRestaurant: (roomId: string, restaurantId: string) => void;
  complete: (roomId: string, mode?: MealMode) => MealRecord | undefined;
}
export const useMealStore = create<MealState>()(persist((set, get) => ({
  rooms: {}, records: [], menuCatalog: menus, restaurantCatalog: restaurants,
  configureRoom: (roomId, options, participants, demo = false) => set(state => {
    const room = state.rooms[roomId] ?? emptyRoom
    return { rooms: { ...state.rooms, [roomId]: { ...room, options: { ...room.options, ...options },
      ...(participants ? { participants, currentParticipantId: participants.some(member => member.id === room.currentParticipantId) ? room.currentParticipantId : participants[0]?.id ?? '', ballots: {}, demo, started: false, completedRecordId: undefined } : {}),
    } } }
  }),
  setCatalog: (menuCatalog, restaurantCatalog) => set({ menuCatalog, restaurantCatalog }),
  startMeal: (roomId, forceNew = false) => {
    const state = get()
    const room = state.rooms[roomId] ?? emptyRoom
    if (!forceNew && room.started && !room.completedRecordId) return room.candidates.length === 3
    let candidates = pickCandidates(state.menuCatalog, room.options.categories)
    if (room.demo && candidates.length === 0) candidates = pickCandidates(menus, [])
    if (candidates.length !== 3) return false
    const next: RoomMeal = { ...room, sessionId: crypto.randomUUID(), started: true, candidates,
      ballots: {}, restaurantId: '', completedRecordId: undefined,
    }
    if (room.demo) {
      const preferred = candidates.find(menu => menu.id === 'pho') ?? candidates[0]
      const otherMenus = candidates.filter(menu => menu.id !== preferred.id)
      next.ballots = Object.fromEntries(room.participants.filter(member => member.id !== room.currentParticipantId).map((member, index) => [member.id,
        Object.fromEntries(candidates.map(menu => [menu.id, menu.id === preferred.id || (menu.id === otherMenus[0]?.id && index < 2) || (menu.id === otherMenus[1]?.id && index === 0) ? 'like' : 'dislike'])),
      ]))
    }
    next.restaurantId = recommendedRestaurants(next, state.restaurantCatalog)[0]?.id ?? ''
    set({ rooms: { ...state.rooms, [roomId]: next } })
    return true
  },
  setCurrentParticipant: (roomId, participantId) => set(state => {
    const room = state.rooms[roomId] ?? emptyRoom
    return room.participants.some(member => member.id === participantId) ? { rooms: { ...state.rooms, [roomId]: { ...room, currentParticipantId: participantId } } } : {}
  }),
  vote: (roomId, menuId, choice) => {
    const state = get()
    const room = state.rooms[roomId] ?? emptyRoom
    if (room.completedRecordId || !room.candidates.some(menu => menu.id === menuId) || !['like', 'dislike'].includes(choice) || !room.participants.some(member => member.id === room.currentParticipantId)) return
    set({ rooms: { ...state.rooms, [roomId]: { ...room, ballots: { ...room.ballots,
      [room.currentParticipantId]: { ...room.ballots[room.currentParticipantId], [menuId]: choice },
    } } } })
  },
  selectRestaurant: (roomId, restaurantId) => {
    const state = get()
    const room = state.rooms[roomId] ?? emptyRoom
    if (room.completedRecordId || !recommendedRestaurants(room, state.restaurantCatalog).some(item => item.id === restaurantId)) return
    set({ rooms: { ...state.rooms, [roomId]: { ...room, restaurantId } } })
  },
  complete: (roomId, mode) => {
    const state = get()
    const room = state.rooms[roomId] ?? emptyRoom
    if (room.completedRecordId) return state.records.find(record => record.id === room.completedRecordId)
    const winner = uniqueWinner(room)
    if (!winner || !allVotesComplete(room)) return undefined
    const finalMode = mode ?? room.options.mode
    const restaurant = recommendedRestaurants(room, state.restaurantCatalog).find(item => item.id === room.restaurantId)
    if (finalMode === 'restaurant' && !restaurant) return undefined
    const record: MealRecord = { id: crypto.randomUUID(), sessionId: room.sessionId, roomId, date: localDate(),
      menuId: winner.id, menu: winner.name, mode: finalMode,
      restaurantId: finalMode === 'restaurant' ? restaurant?.id : undefined,
      restaurant: finalMode === 'delivery' ? '배달' : restaurant!.name,
    }
    set({ records: [...state.records, record], rooms: { ...state.rooms, [roomId]: { ...room, completedRecordId: record.id } } })
    return record
  },
}), {
  name: 'bappick-meal-demo', version: 2,
  migrate: persisted => {
    const old = persisted as { rooms?: Record<string, { votes?: Record<string, Choice>; restaurantId?: string }>; records?: MealRecord[] }
    return {
      rooms: Object.fromEntries(Object.entries(old.rooms ?? {}).map(([id, room]) => [id, { ...emptyRoom, sessionId: crypto.randomUUID(), started: true,
        restaurantId: room.restaurantId ?? restaurants[0].id, ballots: { ...demoBallots, [emptyRoom.currentParticipantId]: room.votes ?? {} },
      }])),
      records: (old.records ?? []).map(record => ({ ...record, sessionId: record.sessionId ?? `legacy-${record.id}`, mode: record.mode ?? 'restaurant' })),
      menuCatalog: menus, restaurantCatalog: restaurants,
    }
  },
}))
export function useRoomMeal(roomId: string) {
  return useMealStore(state => state.rooms[roomId] ?? emptyRoom)
}
