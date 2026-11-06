import { useEffect, useId, useRef, type ReactNode } from 'react'
import Button from './Button'

export type BottomSheetProps = {
  open: boolean
  onClose: () => void
  title: string
  children?: ReactNode
}

export default function BottomSheet({ open, onClose, title, children }: BottomSheetProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const titleId = useId()

  useEffect(() => {
    const dialog = dialogRef.current
    if (open) {
      dialog?.showModal()
    } else {
      dialog?.close()
    }
  }, [open])

  return (
    <dialog
      ref={dialogRef}
      className="bottom-sheet"
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault()
        onClose()
      }}
    >
      <h2 id={titleId}>{title}</h2>
      {children}
      <Button onClick={onClose}>닫기</Button>
    </dialog>
  )
}
