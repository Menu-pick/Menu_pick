import { useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { MealButton, MealScreen, Notice, useMealRoom } from '../../features/meal/MealUI'
import { assets } from '../../features/meal/assets'

const exceptions = {
  E04: { title: '아직 투표가 부족해요', description: ['모두의 선택이 모이면', '결과를 확인할 수 있어요.'], hint: '모두의 투표가 모이면 결과가 열려요.', action: '조금 더 기다리기', art: assets.e04.imgExceptionIllustration, bubble: assets.e04.imgExceptionIconBubble, icon: assets.e04.imgExceptionIconClock, divider: assets.e04.imgExceptionDivider, background: assets.e04.imgE04 },
  E05: { title: '주변 식당을 찾지 못했어요', description: ['현재 위치 근처에', '추천할 식당이 없어요.'], hint: '위치를 바꾸거나 다시 검색해보세요.', action: '다시 추천받기', art: assets.e05.imgExceptionIllustration, bubble: assets.e05.imgExceptionIconBubble, icon: assets.e05.imgExceptionIconPin, divider: assets.e05.imgExceptionDivider, background: assets.e05.imgE05 },
  E06: { title: '인터넷 연결이 불안정해요', description: ['네트워크 상태를 확인하고', '다시 시도해주세요.'], hint: '연결이 복구되면 이전 단계에서 이어집니다.', action: '다시 시도', art: assets.e06.imgExceptionIllustration, bubble: assets.e06.imgExceptionIconBubble, icon: assets.e06.imgExceptionIconWifi, divider: assets.e06.imgExceptionDivider, background: assets.e06.imgE06 },
} as const

export default function MealErrorPage({ code: suppliedCode }: { code?: 'E04' | 'E05' | 'E06' }) {
  const roomId = useMealRoom()
  const { errorCode = 'E06' } = useParams()
  const code = suppliedCode ?? (errorCode in exceptions ? errorCode as keyof typeof exceptions : 'E06')
  const content = exceptions[code]
  const navigate = useNavigate()
  const [notice, setNotice] = useState('')
  const retry = () => {
    if (code === 'E06' && !navigator.onLine) { setNotice('아직 인터넷에 연결되지 않았어요. 연결 상태를 확인해주세요.'); return }
    navigate(code === 'E04' ? `/room/${roomId}/vote` : code === 'E05' ? `/room/${roomId}/result?sheet=open` : `/room/${roomId}/roulette`, { replace: true })
  }
  return <MealScreen className="exception-page" background={content.background}>
    <div className="exception-art"><img className="exception-bowl" src={content.art} alt="밥픽 밥그릇" /><img className="exception-bubble" src={content.bubble} alt="" /><img className="exception-icon" src={content.icon} alt="" /></div>
    <div className="exception-content"><h1>{content.title}</h1><p>{content.description.map(line => <span key={line}>{line}</span>)}</p></div>
    <img className="exception-divider" src={content.divider} alt="" /><p className="exception-hint">{content.hint}</p>
    <div className="meal-footer"><MealButton onClick={retry}>{content.action}</MealButton></div><Notice>{notice}</Notice>
  </MealScreen>
}
