import { useEffect, useRef, useState } from 'react'
import { useStoredState } from '../hooks/useStoredState'
import { useTicker } from '../hooks/useTicker'
import { useWakeLock } from '../hooks/useWakeLock'
import { formatClock } from '../lib/format'
import { parseDuration } from '../lib/parse'
import { clockText, stepClock } from '../lib/steps'
import { Button } from './Button'
import { buzz } from './fx'
import { CheckIcon, PauseIcon, PlayIcon, StopIcon } from './icons'
import { ProgressRing } from './ProgressRing'
import { Stepper } from './Stepper'

interface Props {
  /** Seconds to start from (the target, or the last hold). */
  initialSeconds: number
  /** "Hold", "Round"... */
  noun: string
  setNumber: number
  color: string
  /** Keeps a running countdown through leaving the screen or the app closing (one per workout + activity). */
  timerKey?: string
  onLog: (seconds: number) => Promise<void>
}

type Timer = { state: 'idle' } | { state: 'running'; endsAt: number; total: number } | { state: 'paused'; left: number; total: number }

const IDLE: Timer = { state: 'idle' }

const isTimer = (value: unknown): value is Timer => {
  if (typeof value !== 'object' || value === null) return false
  const t = value as Record<string, unknown>
  if (t.state === 'idle') return true
  if (typeof t.total !== 'number' || t.total <= 0) return false
  // A countdown that ended more than an hour ago is stale, not a hold to log now.
  if (t.state === 'running') return typeof t.endsAt === 'number' && Date.now() - t.endsAt < 60 * 60 * 1000
  return t.state === 'paused' && typeof t.left === 'number'
}

/** A timed hold or round: set the length, then run a countdown that logs itself when it ends. */
export function TimeEntry({ initialSeconds, noun, setNumber, color, timerKey, onLog }: Props) {
  const [text, setText] = useState(clockText(initialSeconds))
  const [timer, setTimer] = useStoredState<Timer>(timerKey && `countdown:${timerKey}`, IDLE, isTimer)
  const [busy, setBusy] = useState(false)
  const now = useTicker(timer.state === 'running')
  useWakeLock(timer.state === 'running')
  const logged = useRef(false)

  const seconds = parseDuration(text)
  const left = timer.state === 'running' ? Math.max(0, timer.endsAt - now) : timer.state === 'paused' ? timer.left : 0
  const total = timer.state === 'idle' ? 0 : timer.total

  async function log(value: number) {
    if (busy) return
    // Forget the countdown first, so the next entry (mounted after the log) never picks it up again.
    setTimer(IDLE)
    setBusy(true)
    try {
      await onLog(value)
    } finally {
      setBusy(false)
    }
  }

  // The countdown logs the set by itself when it reaches zero.
  useEffect(() => {
    if (timer.state !== 'running' || left > 0 || logged.current) return
    logged.current = true
    buzz([90, 60, 90])
    void log(Math.round(timer.total / 1000))
  }) // eslint-disable-line react-hooks/exhaustive-deps

  if (timer.state !== 'idle') {
    const elapsed = Math.round((total - left) / 1000)
    return (
      <div className="mt-3 flex flex-col items-center gap-3 rounded-2xl bg-bg p-4">
        <ProgressRing value={total ? 1 - left / total : 0} size={168} stroke={12} color={color} label={`${noun} ${setNumber}`}>
          <div>
            <p className="font-display text-5xl font-extrabold">{formatClock(left + 999)}</p>
            <p className="text-sm font-bold text-muted">
              {noun} {setNumber}
            </p>
          </div>
        </ProgressRing>
        <div className="grid w-full grid-cols-2 gap-2">
          {timer.state === 'running' ? (
            <Button onClick={() => setTimer({ state: 'paused', left, total })}>
              <PauseIcon /> Pause
            </Button>
          ) : (
            <Button onClick={() => setTimer({ state: 'running', endsAt: Date.now() + left, total })}>
              <PlayIcon /> Resume
            </Button>
          )}
          <Button variant="primary" disabled={busy || elapsed < 1} onClick={() => { logged.current = true; void log(elapsed) }}>
            <StopIcon /> Stop &amp; log
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="mt-3">
      <Stepper label={`${noun} length`} value={text} inputMode="text" onChange={setText} onStep={(d) => setText(stepClock(text, d * 15))} invalid={seconds === null} placeholder="0:30" />
      <div className="mt-2 grid grid-cols-2 gap-2">
        <Button
          variant="primary"
          className="min-h-14"
          disabled={seconds === null}
          onClick={() => {
            if (seconds === null) return
            logged.current = false
            buzz(10)
            setTimer({ state: 'running', endsAt: Date.now() + seconds * 1000, total: seconds * 1000 })
          }}
        >
          <PlayIcon /> Start timer
        </Button>
        <Button className="min-h-14" disabled={seconds === null || busy} onClick={() => seconds !== null && log(seconds)}>
          <CheckIcon /> Log {noun.toLowerCase()} {setNumber}
        </Button>
      </div>
    </div>
  )
}
