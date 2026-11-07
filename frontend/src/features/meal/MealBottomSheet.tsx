import { useEffect, useId, useRef, type ReactNode } from 'react'
import Button from '../../components/common/Button'

export type BottomSheetProps = {
  open: boolean
  onClose: () => void
  title: string
  children?: ReactNode
  className?: string
  showHandle?: boolean
}

export default function BottomSheet({ open, onClose, title, children, className = '', showHandle = false }: BottomSheetProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const titleId = useId()

  useEffect(() => {
    const dialog = dialogRef.current
    if (open) {
      dialog?.showModal()
      if (showHandle) dialog?.focus()
    } else {
      dialog?.close()
    }
  }, [open, showHandle])

  return (
    <dialog
      ref={dialogRef}
      className={`bottom-sheet ${className}`}
      aria-labelledby={titleId}
      tabIndex={showHandle ? -1 : undefined}
      onCancel={(event) => {
        event.preventDefault()
        onClose()
      }}
    >
      {showHandle && <Button className="sheet-handle" aria-label="닫기" onClick={onClose} />}
      <h2 id={titleId}>{title}</h2>
      {children}
      {!showHandle && <Button onClick={onClose}>닫기</Button>}
    </dialog>
  )
}
