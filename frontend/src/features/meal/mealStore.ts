import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { assets } from './assets'

export const menus = [
  { id: 'pho', name: '쌀국수', image: assets.vote.imgUnsplashAoMYg6Qnedu, votes: 3 },
  { id: 'mala', name: '마라탕', image: assets.vote.imgRectangle24, votes: 2 },
  { id: 'noodles', name: '칼국수', image: assets.vote.imgRectangle28, votes: 1 },
] as const
export const restaurants = [
  { id: 'mibundang', name: '미분당', monogram: '미', distance: '도보 4분 · 280m' },
  { id: 'popo', name: '포포쌀국수', monogram: '포', distance: '도보 6분 · 450m' },
  { id: 'saigon', name: '사이공포', monogram: '사', distance: '도보 8분 · 650m' },
] as const
export type Choice = 'like' | 'dislike'
export type MealRecord = { id: string; roomId: string; date: string; menu: string; restaurant: string }
type RoomMeal = { votes: Record<string, Choice>; restaurantId: string }
const emptyRoom: RoomMeal = { votes: {}, restaurantId: restaurants[0].id }
type MealState = {
  rooms: Record<string, RoomMeal>
  records: MealRecord[]
  vote: (roomId: string, menuId: string, choice: Choice) => void
  selectRestaurant: (roomId: string, restaurantId: string) => void
  complete: (roomId: string) => void
  reset: (roomId: string) => void
}
export function localDate(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}
export function rankedMenus(votes: RoomMeal['votes']) {
  return menus.map(menu => ({ ...menu, count: menu.votes + (votes[menu.id] === 'like' ? 1 : 0) }))
    .sort((a, b) => b.count - a.count)
}
// Demo state only. Replace the fixture counts and participants with room API data at integration.
export const useMealStore = create<MealState>()(persist((set) => ({
  rooms: {}, records: [],
  vote: (roomId, menuId, choice) => set(state => ({ rooms: { ...state.rooms,
    [roomId]: { ...(state.rooms[roomId] ?? emptyRoom), votes: { ...state.rooms[roomId]?.votes, [menuId]: choice } },
  } })),
  selectRestaurant: (roomId, restaurantId) => set(state => ({ rooms: { ...state.rooms,
    [roomId]: { ...(state.rooms[roomId] ?? emptyRoom), restaurantId },
  } })),
  reset: roomId => set(state => ({ rooms: { ...state.rooms, [roomId]: { ...emptyRoom, votes: {} } } })),
  complete: roomId => set(state => {
    const room = state.rooms[roomId] ?? emptyRoom
    const menu = rankedMenus(room.votes)[0].name
    const restaurant = restaurants.find(item => item.id === room.restaurantId)?.name ?? restaurants[0].name
    return { records: [...state.records, { id: crypto.randomUUID(), roomId, date: localDate(), menu, restaurant }] }
  }),
}), { name: 'bappick-meal-demo', version: 1 }))
export function useRoomMeal(roomId: string) {
  return useMealStore(state => state.rooms[roomId] ?? emptyRoom)
}
