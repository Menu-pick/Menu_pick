import { useState } from 'react'
import HomeScreen from '../../components/home/HomeScreen'
import { RoomJoinForm } from '../Room/RoomCodePage'
import { RoomSelectionOptions } from '../Room/RoomSelectPage'

type HomeStep = 'default' | 'create-select' | 'join-code'

export default function HomePage() {
  const [step, setStep] = useState<HomeStep>('default')

  return (
    <HomeScreen showCreateRays={step === 'default'} createExpanded={step !== 'default'}
      onCreate={() => setStep(current => current === 'create-select' ? 'default' : 'create-select')}>
      <div id="home-room-options" className="home-page__room-options">
        {step === 'create-select' && <RoomSelectionOptions onJoin={() => setStep('join-code')} />}
        {step === 'join-code' && <RoomJoinForm />}
      </div>
    </HomeScreen>
  )
}
