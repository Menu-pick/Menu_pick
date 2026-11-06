import type { ReactNode } from 'react'

type HeaderProps = {
  title: string
  actions?: ReactNode
}

export default function Header({ title, actions }: HeaderProps) {
  return (
    <header>
      <span>{title}</span>
      {actions}
    </header>
  )
}
