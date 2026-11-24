import { useRef, useState } from 'react'

export function useRoomRequest() {
  const busy = useRef(false)
  const [pending, setPending] = useState(false)

  async function run(action: () => Promise<void>) {
    if (busy.current) return
    busy.current = true
    setPending(true)
    try {
      await action()
    } finally {
      busy.current = false
      setPending(false)
    }
  }

  return { pending, run }
}
