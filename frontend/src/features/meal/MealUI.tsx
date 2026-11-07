import { useState, type ReactNode } from 'react'
import { useNavigate, useParams } from 'react-router'
import Button from '../../components/common/Button'
import { assets } from './assets'
import './meal.css'

export function useMealRoom() {
  return useParams().roomId ?? 'demo'
}
export function MealScreen({ children, className = '', background = assets.slot.img06 }: {
  children: ReactNode; className?: string; background?: string
}) {
  return <section className={`meal-screen ${className}`} style={{ backgroundImage: `url(${background})` }}>{children}</section>
}
export function MealHeader({ title, onBack }: { title: string; onBack?: () => void }) {
  const navigate = useNavigate()
  const roomId = useMealRoom()
  return <header className="meal-header">
    <Button className="meal-back" aria-label="뒤로 가기" onClick={onBack ?? (() => navigate(`/room/${roomId}/waiting`))}>
      <img src={assets.slot.imgEpArrowLeft} alt="" />
    </Button><h1>{title}</h1>
  </header>
}
export function MealButton({ children, secondary = false, className = '', ...props }: React.ComponentProps<typeof Button> & { secondary?: boolean }) {
  return <Button className={`meal-button ${secondary ? 'is-secondary' : ''} ${className}`} {...props}>{children}</Button>
}
export function Divider({ className = '' }: { className?: string }) {
  return <div className={`meal-divider ${className}`} aria-hidden="true"><img src={assets.slot.imgChatGptImage20269160941261} alt="" /></div>
}
export function useShare() {
  const [notice, setNotice] = useState('')
  const share = async (text: string, url = window.location.href) => {
    try {
      if (navigator.share) await navigator.share({ title: '밥픽', text, url })
      else if (navigator.clipboard) { await navigator.clipboard.writeText(`${text}\n${url}`); setNotice('공유할 내용과 링크를 복사했어요.') }
      else setNotice('이 브라우저에서는 공유를 지원하지 않아요.')
    } catch (error) {
      if (!(error instanceof DOMException && error.name === 'AbortError')) setNotice('공유하지 못했어요. 다시 시도해주세요.')
    }
  }
  return { share, notice }
}
export function Notice({ children }: { children: ReactNode }) {
  return children ? <p className="meal-notice" role="status">{children}</p> : null
}
