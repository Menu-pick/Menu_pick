import axios from 'axios'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api from '../../api/apiClient'
import { assets } from './assets'
import { localDate, useMealStore, type Choice, type MealRecord, type Menu, type Restaurant, type RoomMeal } from './mealStore'
import { useRoomStore } from '../room/roomStore'

export type ApiMenu = { menuId: number; name: string; category: string; imageUrl: string }
export type ApiSession = { mealSessionId: number; roomId: number; status: 'VOTING' | 'CONFIRMED'; candidates: ApiMenu[]; confirmedMenu: ApiMenu | null; createdAt: string }
export type ApiRoom = { roomId: number; code: string; name: string; mealType: 'DINE_IN' | 'DELIVERY'; categories: string[]; placeName: string; address: string; latitude: number; longitude: number }
export type RoomAccess = { participantId: number; participantToken: string; nickname: string }
export type ApiJoinResponse = { room: ApiRoom; me: RoomAccess }
export type ApiResult = { mealSessionId: number; results: { menu: ApiMenu; likeCount: number; dislikeCount: number; rank: number }[]; votedCount: number; totalCount: number; allVoted: boolean; tie: boolean }
type ApiVote = { menuId: number; voteType: 'LIKE' | 'DISLIKE' }
type ApiRestaurant = { placeId: string; name: string; address: string; latitude: number; longitude: number; distanceMeters: number; distanceType: 'WALKING' | 'STRAIGHT'; walkingMinutes: number | null }

// Room creation/join owns issuing these credentials. Never put tokens in URLs.
export const useMealAccess = create<{ rooms: Record<string, RoomAccess>; save: (roomId: string, me: RoomAccess) => void }>()(persist(set => ({
  rooms: {}, save: (roomId, me) => set(state => ({ rooms: { ...state.rooms, [roomId]: me } })),
}), { name: 'bappick-participants' }))

export const isApiRoom = (roomId: string) => /^[1-9]\d*$/.test(roomId)
const roomPath = (roomId: string) => `/api/rooms/${encodeURIComponent(roomId)}`
const sessionPath = (roomId: string) => `${roomPath(roomId)}/meals/${useMealStore.getState().rooms[roomId].sessionId}`
export function menuFromApi(menu: ApiMenu): Menu {
  // The backend seed's /images/menus/* paths are served by frontend/public.
  return { id: String(menu.menuId), name: menu.name, image: menu.imageUrl, categories: [menu.category] }
}
function updateRoom(roomId: string, update: Partial<RoomMeal>) {
  useMealStore.setState(state => ({ rooms: { ...state.rooms, [roomId]: { ...state.rooms[roomId], ...update } } }))
}
export function registerMealAccess(response: ApiJoinResponse) {
  useMealAccess.getState().save(String(response.room.roomId), response.me)
}
function participantToken(roomId: string) {
  const token = useMealAccess.getState().rooms[roomId]?.participantToken
  if (!token) throw new MealApiError('e02', '참여 정보가 없어요. 초대 코드로 다시 참여해주세요.')
  return token
}
export class MealApiError extends Error {
  code: string
  constructor(code: string, message: string) { super(message); this.code = code }
}
export function mealErrorCode(error: unknown) {
  if (error instanceof MealApiError) return error.code
  if (!axios.isAxiosError(error) || !error.response) return 'e06'
  if (error.response.status === 403) return 'e02'
  if (error.response.status === 404) return 'e01'
  if (error.response.status >= 500) return 'e06'
  return 'e07'
}
export function mealErrorMessage(error: unknown) {
  if (error instanceof MealApiError) return error.message
  if (axios.isAxiosError<{ message?: string }>(error)) return error.response?.data.message || '요청을 처리하지 못했어요. 다시 시도해주세요.'
  return '요청을 처리하지 못했어요. 다시 시도해주세요.'
}

export async function loadApiRoom(roomId: string, signal?: AbortSignal) {
  const [{ data: room }, { data: members }] = await Promise.all([
    api.get<ApiRoom>(roomPath(roomId), { signal }),
    api.get<{ participantId: number; nickname: string }[]>(`${roomPath(roomId)}/participants`, { signal }),
  ])
  if (signal?.aborted) return
  const me = useMealAccess.getState().rooms[roomId]
  const participants = members.map(member => ({ id: String(member.participantId), name: member.nickname, image: assets.result.imgEllipse7 }))
  const options = { name: room.name, location: room.placeName || room.address, categories: room.categories, mode: room.mealType === 'DELIVERY' ? 'delivery' as const : 'restaurant' as const, latitude: room.latitude, longitude: room.longitude }
  const old = useMealStore.getState().rooms[roomId]
  const next: RoomMeal = { ...(old ?? { sessionId: '', started: false, candidates: [], ballots: {}, restaurantId: '' }), demo: false, remote: true, options, participants, currentParticipantId: me ? String(me.participantId) : '' }
  // An old local demo with the same numeric ID must never become server data.
  if (!old?.remote) Object.assign(next, { sessionId: '', started: false, candidates: [], ballots: {}, restaurantId: '', result: undefined, completedRecordId: undefined })
  updateRoom(roomId, next)
  useRoomStore.setState(state => ({ rooms: { ...state.rooms, [roomId]: { id: roomId, code: room.code, demo: false, settings: { name: room.name, location: options.location, mealMode: room.mealType === 'DELIVERY' ? '배달' : '매장', categories: room.categories }, members: participants, currentParticipantId: next.currentParticipantId } } }))
}
function applySession(roomId: string, session: ApiSession) {
  const old = useMealStore.getState().rooms[roomId]
  const changed = old.sessionId !== String(session.mealSessionId) || old.candidates.map(item => item.id).join(',') !== session.candidates.map(item => String(item.menuId)).join(',')
  updateRoom(roomId, { sessionId: String(session.mealSessionId), started: true, candidates: session.candidates.map(menuFromApi), status: session.status, confirmedMenu: session.confirmedMenu ? menuFromApi(session.confirmedMenu) : undefined,
    ...(changed ? { ballots: {}, result: undefined, restaurantId: '', recommendations: undefined, completedRecordId: undefined } : {}),
  })
}
export async function loadSession(roomId: string, draw = false, signal?: AbortSignal) {
  const response = draw
    ? await api.post<ApiSession>(`${roomPath(roomId)}/meals`, undefined, { signal })
    : await api.get<ApiSession>(`${roomPath(roomId)}/meals/current`, { signal })
  if (!signal?.aborted) applySession(roomId, response.data)
  return response.data
}
export async function redrawSession(roomId: string) {
  const { data } = await api.post<ApiSession>(`${sessionPath(roomId)}/redraw`)
  applySession(roomId, data)
  // Redraw may reuse the same session ID and candidate set when the pool is small.
  updateRoom(roomId, { ballots: {}, result: undefined, restaurantId: '', recommendations: undefined, completedRecordId: undefined })
}
function applyMyVotes(roomId: string, votes: ApiVote[]) {
  const room = useMealStore.getState().rooms[roomId]
  updateRoom(roomId, { ballots: { [room.currentParticipantId]: Object.fromEntries(votes.map(vote => [String(vote.menuId), vote.voteType === 'LIKE' ? 'like' : 'dislike'])) } })
}
export async function loadMyVotes(roomId: string, signal?: AbortSignal) {
  const { data } = await api.get<ApiVote[]>(`${sessionPath(roomId)}/votes/me`, { params: { participantToken: participantToken(roomId) }, signal })
  if (!signal?.aborted) applyMyVotes(roomId, data)
}
export async function submitVote(roomId: string, menuId: string, choice: Choice) {
  const { data } = await api.post<ApiVote[]>(`${sessionPath(roomId)}/votes`, { participantToken: participantToken(roomId), menuId: Number(menuId), voteType: choice === 'like' ? 'LIKE' : 'DISLIKE' })
  applyMyVotes(roomId, data)
}
export async function loadResult(roomId: string, signal?: AbortSignal) {
  const { data } = await api.get<ApiResult>(`${sessionPath(roomId)}/votes/result`, { signal })
  if (!signal?.aborted) updateRoom(roomId, { result: { allVoted: data.allVoted, tie: data.tie, totalCount: data.totalCount, counts: Object.fromEntries(data.results.map(item => [String(item.menu.menuId), item.likeCount])) } })
  return data
}
export async function loadRecommendations(roomId: string) {
  const room = useMealStore.getState().rooms[roomId]
  const result = await loadResult(roomId)
  if (!result.allVoted) throw new MealApiError('e04', '아직 투표가 부족해요.')
  if (result.tie) throw new MealApiError('tie', '최다 득표 메뉴가 동점이에요.')
  const winner = result.results[0].menu
  const { latitude, longitude } = room.options
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) throw new MealApiError('e07', '방의 기준 위치를 확인해주세요.')
  const { data } = await api.get<ApiRestaurant[]>('/api/recommendations/restaurants', { params: { menu: winner.name, latitude, longitude } })
  const items: Restaurant[] = data.map(item => ({ ...item, id: item.placeId, monogram: item.name.slice(0, 1), meters: item.distanceMeters, menuIds: [String(winner.menuId)], location: room.options.location,
    distance: item.distanceType === 'WALKING' && item.walkingMinutes ? `도보 ${item.walkingMinutes}분 · ${item.distanceMeters}m` : `직선거리 ${item.distanceMeters}m`,
    mapUrl: `https://map.naver.com/p/search/${encodeURIComponent(`${item.name} ${item.address}`)}`,
  })).sort((a, b) => a.meters - b.meters)
  updateRoom(roomId, { recommendations: items, restaurantId: items.some(item => item.id === room.restaurantId) ? room.restaurantId : items[0]?.id ?? '' })
  if (!items.length) throw new MealApiError('e05', '주변 식당을 찾지 못했어요.')
  return items
}
export async function confirmApiMeal(roomId: string, delivery: boolean): Promise<MealRecord> {
  const room = useMealStore.getState().rooms[roomId]
  const result = await loadResult(roomId)
  if (!result.allVoted) throw new MealApiError('e04', '아직 투표가 부족해요.')
  if (result.tie) throw new MealApiError('tie', '최다 득표 메뉴가 동점이에요.')
  const restaurant = room.recommendations?.find(item => item.id === room.restaurantId)
  if (!delivery && !restaurant) throw new MealApiError('e05', '확정할 식당을 선택해주세요.')
  const { data: session } = await api.post<ApiSession>(`${sessionPath(roomId)}/confirm`, { participantToken: participantToken(roomId) })
  applySession(roomId, session)
  let recordId = `meal-${session.mealSessionId}`
  let date = localDate()
  if (!delivery && restaurant) {
    const { data } = await api.post<{ id: number; confirmedAt: string }>(`${roomPath(roomId)}/restaurants`, {
      placeId: restaurant.id, name: restaurant.name, address: restaurant.address, latitude: restaurant.latitude, longitude: restaurant.longitude,
      distanceMeters: restaurant.meters, distanceType: restaurant.distanceType, walkingMinutes: restaurant.walkingMinutes,
    })
    recordId = `restaurant-${data.id}`
    date = data.confirmedAt.slice(0, 10)
  }
  const menu = session.confirmedMenu!
  const record: MealRecord = { id: recordId, sessionId: String(session.mealSessionId), roomId, date, menuId: String(menu.menuId), menu: menu.name, mode: delivery ? 'delivery' : 'restaurant', restaurantId: restaurant?.id, restaurant: delivery ? '배달' : restaurant!.name }
  useMealStore.setState(state => ({ records: [...state.records.filter(item => !(item.roomId === roomId && item.sessionId === record.sessionId)), record] }))
  updateRoom(roomId, { completedRecordId: record.id })
  return record
}
