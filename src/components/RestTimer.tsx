import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useTicker } from '../hooks/useTicker'
import { useWakeLock } from '../hooks/useWakeLock'
import { formatClock } from '../lib/format'
import { buzz } from './fx'
import { ProgressRing } from './ProgressRing'

interface Props {
  endsAt: number
  total: number
  onChange: (endsAt: number, total: number) => void
  onDone: () => void
}

/** A floating rest countdown after a lifting set: add or take 15 s, or skip it. */
export function RestTimer({ endsAt, total, onChange, onDone }: Props) {
  const now = useTicker(true)
  useWakeLock(true)
  const left = Math.max(0, endsAt - now)
  /** The end time already buzzed for: +15 during "Go!" starts a new countdown that buzzes and closes again. */
  const buzzedFor = useRef<number | null>(null)
  const done = useRef(onDone)
  useEffect(() => {
    done.current = onDone
  })

  useEffect(() => {
    if (left > 0) return
    if (buzzedFor.current !== endsAt) {
      buzzedFor.current = endsAt
      buzz([120, 80, 120])
    }
    const timer = setTimeout(() => done.current(), 1600)
    return () => clearTimeout(timer)
  }, [left, endsAt])

  const shift = (seconds: number) => {
    const nextEnd = Math.max(Date.now() + 5000, endsAt + seconds * 1000)
    onChange(nextEnd, Math.max(total, nextEnd - Date.now()))
  }

  return createPortal(
    <div
      role="timer"
      aria-label="Rest timer"
      className="sheet-panel fixed inset-x-3 bottom-[calc(env(safe-area-inset-bottom)+5.6rem)] z-45 mx-auto flex max-w-md items-center gap-3 rounded-[1.5rem] border border-line p-2.5 pr-3 md:bottom-6"
      style={{ background: 'var(--glass)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }}
    >
      <ProgressRing value={left / total} size={52} stroke={5}>
        <span className="text-[.65rem] font-extrabold text-muted">REST</span>
      </ProgressRing>
      <p className={`min-w-16 font-display text-3xl font-extrabold ${left === 0 ? 'text-target' : ''}`}>{left === 0 ? 'Go!' : formatClock(left + 999)}</p>
      <div className="ml-auto flex gap-1.5">
        <button type="button" className="icon-button !size-10 text-sm" onClick={() => shift(-15)} aria-label="15 seconds less">
          −15
        </button>
        <button type="button" className="icon-button !size-10 text-sm" onClick={() => shift(15)} aria-label="15 seconds more">
          +15
        </button>
        <button type="button" className="icon-button !size-10 !w-auto px-3 text-sm" onClick={onDone}>
          Skip
        </button>
      </div>
    </div>,
    document.body,
  )
}
