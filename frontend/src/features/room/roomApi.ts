import api from '../../api/apiClient'
import { registerMealAccess, type ApiJoinResponse, type ApiRoom } from '../meal/mealApi'
import { useRoomStore, type RoomSettings } from './roomStore'

export const categoryLabels = {
  KOREAN: '한식', CHINESE: '중식', JAPANESE: '일식',
  CAFE_DESSERT: '카페,디저트', FAST_FOOD: '패스트푸드', BUNSIK: '분식',
} as const

type Category = keyof typeof categoryLabels
export const categories = Object.values(categoryLabels)
const categoryEntries = Object.entries(categoryLabels) as [Category, string][]

export type RoomPlace = {
  placeId: string
  name: string
  address: string
  latitude: number
  longitude: number
}

export type RoomResponse = Omit<ApiRoom, 'categories'> & {
  categories: Category[]
  placeId: string
  participantCount: number
  createdAt: string
}

type RoomMutationResponse = Omit<ApiJoinResponse, 'room'> & { room: RoomResponse }

export type RoomParticipant = { participantId: number; nickname: string; joinedAt: string }

function roomPayload(settings: RoomSettings, place: RoomPlace, nickname: string) {
  return {
    name: settings.name,
    nickname,
    mealType: settings.mealMode === '배달' ? 'DELIVERY' as const : 'DINE_IN' as const,
    categories: categoryEntries.filter(([, label]) => settings.categories.includes(label)).map(([key]) => key),
    placeId: place.placeId,
    placeName: place.name,
    address: place.address,
    latitude: place.latitude,
    longitude: place.longitude,
  }
}

export function roomSettings(room: RoomResponse): RoomSettings {
  return {
    name: room.name,
    location: room.placeName,
    mealMode: room.mealType === 'DELIVERY' ? '배달' : '매장',
    categories: room.categories.map(category => categoryLabels[category]),
  }
}

export function roomPlace(room: RoomResponse): RoomPlace {
  return { placeId: room.placeId, name: room.placeName, address: room.address, latitude: room.latitude, longitude: room.longitude }
}

export async function listRooms(roomIds: string[], signal: AbortSignal) {
  const { data } = await api.get<RoomResponse[]>('/api/rooms', {
    params: roomIds.length ? { roomIds: roomIds.join(',') } : undefined, signal,
  })
  return data
}

export async function getRoom(roomId: string, signal: AbortSignal) {
  const { data } = await api.get<RoomResponse>(`/api/rooms/${roomId}`, { signal })
  return data
}

export async function listParticipants(roomId: string, signal: AbortSignal) {
  const { data } = await api.get<RoomParticipant[]>(`/api/rooms/${roomId}/participants`, { signal })
  return data
}

export async function searchPlaces(query: string, signal: AbortSignal) {
  const { data } = await api.get<RoomPlace[]>('/api/recommendations/locations', { params: { query }, signal })
  return data
}

export async function createRoom(settings: RoomSettings, place: RoomPlace, nickname: string) {
  const { data } = await api.post<RoomMutationResponse>('/api/rooms', roomPayload(settings, place, nickname))
  registerMealAccess(data)
  return data.room
}

export async function joinRoom(code: string, nickname: string) {
  const { data } = await api.post<RoomMutationResponse>('/api/rooms/join', { code, nickname })
  registerMealAccess(data)
  return data.room
}

export async function updateRoom(roomId: string, settings: RoomSettings, place: RoomPlace, nickname: string, participantToken: string) {
  const { data } = await api.patch<RoomMutationResponse>(`/api/rooms/${roomId}`, {
    ...roomPayload(settings, place, nickname), participantToken,
  })
  registerMealAccess(data)
  useRoomStore.setState(state => {
    const room = state.rooms[roomId]
    if (!room) return state
    return { rooms: { ...state.rooms, [roomId]: { ...room, settings: roomSettings(data.room) } } }
  })
}
