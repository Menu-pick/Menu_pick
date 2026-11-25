import type { ComponentPropsWithoutRef } from 'react'

type InputProps = ComponentPropsWithoutRef<'input'>

export default function Input(props: InputProps) {
  return <input {...props} />
}
