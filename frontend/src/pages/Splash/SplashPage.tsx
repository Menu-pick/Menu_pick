import { useEffect } from 'react'
import { useNavigate } from 'react-router'
import logoBowl from '../../assets/images/LogoBowl.svg'
import logoWord from '../../assets/images/LogoWord.svg'
import './SplashPage.css'

export default function SplashPage() {
  const navigate = useNavigate()

  useEffect(() => {
    const timer = window.setTimeout(() => void navigate('/home', { replace: true }), 2000)
    return () => window.clearTimeout(timer)
  }, [navigate])

  return (
    <div className="splash-page">
      <div className="splash-page__logo">
        <img src={logoWord} alt="밥픽" width="152" height="82" />
        <img src={logoBowl} alt="" width="91" height="105" />
      </div>
    </div>
  )
}
