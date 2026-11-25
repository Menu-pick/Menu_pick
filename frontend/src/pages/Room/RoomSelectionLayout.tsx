import type { ReactNode } from 'react'
import HomeScreen from '../../components/home/HomeScreen'
import './RoomSelectPage.css'

type RoomSelectionLayoutProps = {
  children: ReactNode
  createLink: string
}

export default function RoomSelectionLayout({ children, createLink }: RoomSelectionLayoutProps) {
  return (
    <HomeScreen
      className="room-selection-page"
      slogan={<>친구들과 밥 메뉴,<br />같이 정해요</>}
      createLink={createLink}
    >
      {children}
    </HomeScreen>
  )
}
