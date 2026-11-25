import type { ComponentPropsWithoutRef } from 'react'

type ButtonProps = ComponentPropsWithoutRef<'button'>

export default function Button({ type = 'button', ...props }: ButtonProps) {
  return <button type={type} {...props} />
}
