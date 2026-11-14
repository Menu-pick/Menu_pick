import { useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router'
import bowl from '../../assets/images/error_icon.png'
import workInProgress from '../../assets/images/error_GPT_image.png'
import home from '../../assets/icons/Icon home.svg'
import question from '../../assets/icons/Icon question.svg'
import users from '../../assets/icons/Icon users.svg'
import clock from '../../assets/icons/Icon clock.svg'
import pin from '../../assets/icons/Icon pin.svg'
import wifi from '../../assets/icons/Icon wifi.svg'
import '../Room/CreateRoomPage.css'
import './ErrorPage.css'

const exceptions = {
  e01: { icon: home, title: '참여 중인 방이 없어요', lines: ['친구와 함께 먹을 메뉴를', '새로 정해볼까요?'], hint: '새로운 방을 만들면 바로 시작할 수 있어요.', label: '방 만들기', to: '/room/select' },
  e02: { icon: question, title: '코드가 올바르지 않아요', lines: ['입력한 방 코드를', '다시 확인해주세요.'], hint: '영문과 숫자를 다시 확인해주세요.', label: '다시 입력', to: '/room/select/code' },
  e03: { icon: users, title: '친구를 기다리는 중이에요', lines: ['친구들이 참여하면', '메뉴 후보를 뽑을 수 있어요.'], hint: '참여자가 모이면 다음 단계로 넘어가요.', label: '링크 공유하기' },
  e04: { icon: clock, title: '아직 투표가 부족해요', lines: ['모두의 선택이 모이면', '결과를 확인할 수 있어요.'], hint: '모두의 투표가 모이면 결과가 열려요.', label: '조금 더 기다리기' },
  e05: { icon: pin, title: '주변 식당을 찾지 못했어요', lines: ['현재 위치 근처에', '추천할 식당이 없어요.'], hint: '위치를 바꾸거나 다시 검색해보세요.', label: '다시 추천받기' },
  e06: { icon: wifi, title: '인터넷 연결이 불안정해요', lines: ['네트워크 상태를 확인하고', '다시 시도해주세요.'], hint: '연결이 복구되면 이전 단계에서 이어집니다.', label: '다시 시도' },
  e07: { icon: null, title: '아직 개발중인 기능입니다', lines: [], hint: '더 나은 서비스를 제공하기위해 준비하고있어요.', label: '뒤로가기' },
} satisfies Record<string, { icon: string | null; title: string; lines: string[]; hint: string; label: string; to?: string }>

export default function ErrorPage() {
  const { code } = useParams()
  const key = code?.toLowerCase() ?? ''
  const variant = Object.hasOwn(exceptions, key) ? key as keyof typeof exceptions : 'e07'
  return <ExceptionScreen key={variant} variant={variant} />
}

function ExceptionScreen({ variant }: { variant: keyof typeof exceptions }) {
  const screen = exceptions[variant]
  const navigate = useNavigate()
  const { state } = useLocation()
  const [feedback, setFeedback] = useState('')
  const returnTo = typeof state?.returnTo === 'string' && state.returnTo.startsWith('/') && !state.returnTo.startsWith('//') && !state.returnTo.startsWith('/error/')
    ? state.returnTo as string : undefined

  async function handleAction() {
    if (variant !== 'e03') {
      if (variant === 'e06' && !navigator.onLine) {
        setFeedback('아직 인터넷에 연결되지 않았어요. 연결 상태를 확인해주세요.')
        return
      }
      if (returnTo) {
        void navigate(returnTo, { replace: true, state: state?.returnState })
        return
      }
      if (window.history.state?.idx > 0) void navigate(-1)
      else void navigate('/home', { replace: true })
      return
    }

    const code = state?.roomCode
    if (typeof code !== 'string' || !code.trim()) {
      setFeedback('공유할 방 코드가 없어요.')
      return
    }
    const url = new URL('/room/select/code', window.location.origin)
    url.searchParams.set('code', code)
    try {
      if (navigator.share) await navigator.share({ title: '밥픽 방 초대', url: url.href })
      else {
        await navigator.clipboard.writeText(url.href)
        setFeedback('초대 링크를 복사했어요.')
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return
      setFeedback('초대 링크를 공유하지 못했어요.')
    }
  }

  return (
    <div className={screen.icon ? 'room-setup exception-page' : 'room-setup exception-page exception-page--development'}>
      <div className="exception-page__art" aria-hidden="true">
        <img className="exception-page__illustration" src={screen.icon ? bowl : workInProgress} alt="" />
        {screen.icon && <span className="exception-page__bubble"><img src={screen.icon} alt="" /></span>}
      </div>
      <h1>{screen.title}</h1>
      {screen.lines.length > 0 && (
        <p className="exception-page__description">
          {screen.lines.map((line) => <span key={line}>{line}</span>)}
        </p>
      )}
      <div className="exception-page__divider" aria-hidden="true"><span /></div>
      <p className="exception-page__hint">{screen.hint}</p>
      <footer className="exception-page__footer">
        {feedback && <p className="exception-page__hint" role="status">{feedback}</p>}
        {'to' in screen
          ? <Link className="exception-page__action" to={returnTo ?? screen.to}>{screen.label}</Link>
          : <button className="exception-page__action" type="button" onClick={handleAction}>{screen.label}</button>}
      </footer>
    </div>
  )
}
