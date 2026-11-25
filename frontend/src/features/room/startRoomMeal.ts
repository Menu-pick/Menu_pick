import { loadApiRoom, loadSession, MealApiError, useMealAccess } from '../meal/mealApi'
import { useRoomStore } from './roomStore'

const starting = new Map<string, Promise<void>>()

export function startRoomMeal(roomId: string) {
  const pending = starting.get(roomId)
  if (pending) return pending
  const request = start(roomId).finally(() => starting.delete(roomId))
  starting.set(roomId, request)
  return request
}

async function start(roomId: string) {
  if (!useMealAccess.getState().rooms[roomId]) {
    throw new MealApiError('e02', '참여 정보가 없어요. 초대 코드로 참여해주세요.')
  }
  await loadApiRoom(roomId)
  if (useRoomStore.getState().rooms[roomId].members.length < 2) {
    throw new MealApiError('e03', '친구가 참여하면 메뉴 후보를 뽑을 수 있어요.')
  }
  await loadSession(roomId, true)
}
