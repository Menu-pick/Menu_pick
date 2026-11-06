import type { ReactNode } from 'react'

type MobileLayoutProps = {
  children: ReactNode
}

export default function MobileLayout({ children }: MobileLayoutProps) {
  return <main className="mobile-layout">{children}</main>
}
