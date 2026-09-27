import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

const SHOW_MS = 4000

/**
 * A short message floating just above the tab bar ("Weight unit set to kg."), so it is seen wherever
 * the page is scrolled. Give it a new `key` per message to restart its time.
 */
export function Toast({ message, onDone }: { message: string; onDone: () => void }) {
  const done = useRef(onDone)
  useEffect(() => {
    done.current = onDone
  })
  useEffect(() => {
    const timer = setTimeout(() => done.current(), SHOW_MS)
    return () => clearTimeout(timer)
  }, [])

  return createPortal(
    <div role="status" className="undo-toast !py-3 !pr-4">
      <span className="min-w-0 flex-1 font-semibold">{message}</span>
    </div>,
    document.body,
  )
}
