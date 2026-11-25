import { useEffect, useId, useRef, type ReactNode } from 'react'
import Button from '../../components/common/Button'

export type BottomSheetProps = {
  open: boolean
  onClose: () => void
  title: string
  children?: ReactNode
  className?: string
  showHandle?: boolean
  dismissOnBackdrop?: boolean
}

export default function BottomSheet({ open, onClose, title, children, className = '', showHandle = false, dismissOnBackdrop = false }: BottomSheetProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const pointerStartedOutside = useRef(false)
  const titleId = useId()
  const isOutside = (x: number, y: number) => {
    const bounds = dialogRef.current?.getBoundingClientRect()
    return Boolean(bounds && (x < bounds.left || x > bounds.right || y < bounds.top || y > bounds.bottom))
  }

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
      onPointerDown={(event) => {
        pointerStartedOutside.current = isOutside(event.clientX, event.clientY)
      }}
      onPointerUp={(event) => {
        if (dismissOnBackdrop && pointerStartedOutside.current && isOutside(event.clientX, event.clientY)) onClose()
        pointerStartedOutside.current = false
      }}
      onCancel={(event) => {
        event.preventDefault()
        onClose()
      }}
    >
      {showHandle && <span className="sheet-handle" aria-hidden="true" />}
      <h2 id={titleId}>{title}</h2>
      {children}
      {!showHandle && <Button onClick={onClose}>닫기</Button>}
    </dialog>
  )
}
