import { useState } from 'react'
import { formatDuration, formatTime } from '../lib/format'
import { Button } from './Button'

const keptKey = (sessionId: string) => `fitpip.time-kept.${sessionId}`

interface Props {
  sessionId: string
  durationMs: number
  /** The last set's time: when it most likely really ended. */
  lastSetAt: string
  busy: boolean
  onFinishAtLastSet: () => void
  onChangeTime: () => void
}

/** A finished workout that ran on for hours after its last set: offers to end it at that set instead. */
export function FinishedLateNotice({ sessionId, durationMs, lastSetAt, busy, onFinishAtLastSet, onChangeTime }: Props) {
  const [kept, setKept] = useState(() => {
    try {
      return localStorage.getItem(keptKey(sessionId)) !== null
    } catch {
      return false
    }
  })
  if (kept) return null

  const keep = () => {
    setKept(true)
    try {
      localStorage.setItem(keptKey(sessionId), '1')
    } catch {
      // storage blocked: it just shows again next time
    }
  }
  const when = formatTime(lastSetAt)

  return (
    <section role="status" className="card card-pad mb-3 border-accent/40">
      <p className="font-display text-lg font-extrabold">Left the clock running?</p>
      <p className="mt-1 text-sm text-muted">
        This workout says {formatDuration(durationMs)}, but the last set was logged at {when}. End it there so the time is right.
      </p>
      <div className="mt-3 grid grid-cols-1 gap-2 min-[360px]:grid-cols-2">
        <Button variant="primary" size="sm" disabled={busy} onClick={onFinishAtLastSet}>
          End at {when}
        </Button>
        <Button size="sm" disabled={busy} onClick={onChangeTime}>
          Pick the time
        </Button>
      </div>
      <button type="button" disabled={busy} onClick={keep} className="mt-2 min-h-9 w-full text-center text-sm font-bold text-muted">
        No, it really took that long
      </button>
    </section>
  )
}
