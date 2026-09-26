import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

interface Props {
  message: string
  onUndo: () => void
  /** Called when the time to undo runs out. */
  onExpire: () => void
  /** Sit higher, clear of the rest timer. */
  raised?: boolean
}

const UNDO_MS = 7000

/** A short-lived "Set deleted · Undo" bar. Give it a new `key` for each deletion so the countdown restarts. */
export function UndoToast({ message, onUndo, onExpire, raised = false }: Props) {
  const expire = useRef(onExpire)
  useEffect(() => {
    expire.current = onExpire
  })
  useEffect(() => {
    const timer = setTimeout(() => expire.current(), UNDO_MS)
    return () => clearTimeout(timer)
  }, [])

  return createPortal(
    <div role="status" className="undo-toast" data-raised={raised}>
      <span className="min-w-0 flex-1 font-semibold">{message}</span>
      <button type="button" className="undo-toast-button" onClick={onUndo}>
        Undo
      </button>
    </div>,
    document.body,
  )
}
