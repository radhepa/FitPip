import { useState } from 'react'
import { useStoredState } from '../hooks/useStoredState'
import { useTicker } from '../hooks/useTicker'
import { useWakeLock } from '../hooks/useWakeLock'
import { formatClock } from '../lib/format'
import { parseDistance, parseDuration } from '../lib/parse'
import { clockText, stepClock, stepNumber } from '../lib/steps'
import { formatPace, toMetres, type LengthUnit } from '../lib/units'
import { Button } from './Button'
import { buzz } from './fx'
import { CheckIcon, PlayIcon, StopIcon } from './icons'
import { Stepper } from './Stepper'

interface Props {
  initialSeconds: number | null
  initialDistance: string
  lengthUnit: LengthUnit
  /** Keeps a running stopwatch through leaving the screen or the app closing (one per workout + activity). */
  timerKey?: string
  onLog: (seconds: number | null, metres: number | null) => Promise<void>
}

/** A stopwatch start time worth restoring: a number, and not left running for more than a day. */
const isStart = (value: unknown): value is number | null =>
  value === null || (typeof value === 'number' && value <= Date.now() && Date.now() - value < 24 * 60 * 60 * 1000)

const DISTANCE_STEP: Record<LengthUnit, number> = { km: 0.5, mi: 0.25, m: 50, yd: 25 }

/** A run, ride, swim or game: time (typed or from the stopwatch) and distance, with live pace. */
export function DistanceEntry({ initialSeconds, initialDistance, lengthUnit, timerKey, onLog }: Props) {
  const [time, setTime] = useState(initialSeconds ? clockText(initialSeconds) : '')
  const [distance, setDistance] = useState(initialDistance)
  const [startedAt, setStartedAt] = useStoredState<number | null>(timerKey && `stopwatch:${timerKey}`, null, isStart)
  const [busy, setBusy] = useState(false)
  const now = useTicker(startedAt !== null, 500)
  useWakeLock(startedAt !== null)

  // A bare number of minutes ("30") is what people type for a run; "26:10" works too.
  const seconds = parseDuration(time, 'minutes')
  const parsedDistance = parseDistance(distance)
  const metres = parsedDistance ? toMetres(parsedDistance, lengthUnit) : null
  const valid = (seconds !== null || metres !== null) && (time === '' || seconds !== null) && parsedDistance !== undefined
  const pace = formatPace(seconds, metres, lengthUnit)

  async function log() {
    if (!valid || busy) return
    setBusy(true)
    try {
      await onLog(seconds, metres)
    } finally {
      setBusy(false)
    }
  }

  if (startedAt !== null) {
    return (
      <div className="mt-3 flex flex-col items-center gap-3 rounded-2xl bg-bg p-5">
        <span className="live-dot" aria-hidden="true" />
        <p className="font-display text-6xl font-extrabold" role="timer">
          {formatClock(now - startedAt)}
        </p>
        <Button
          variant="primary"
          block
          className="min-h-14"
          onClick={() => {
            buzz(20)
            setTime(clockText(Math.max(1, Math.round((Date.now() - startedAt) / 1000))))
            setStartedAt(null)
          }}
        >
          <StopIcon /> Stop
        </Button>
      </div>
    )
  }

  return (
    <div className="mt-3">
      <div className="grid grid-cols-2 gap-2">
        <Stepper label="Time" value={time} inputMode="text" onChange={setTime} onStep={(d) => setTime(stepClock(time, d * 60, 'minutes', 60))} invalid={time !== '' && seconds === null} placeholder="min" stackOnPhone />
        <Stepper
          label={`Distance · ${lengthUnit}`}
          value={distance}
          onChange={setDistance}
          onStep={(d) => setDistance(stepNumber(distance, d * DISTANCE_STEP[lengthUnit]))}
          invalid={parsedDistance === undefined}
          placeholder="–"
          stackOnPhone
        />
      </div>
      <p className="mt-2 min-h-5 text-center text-sm font-semibold text-muted">{pace ? `Pace ${pace}` : 'Type minutes (30) or a time (26:10). Distance is optional.'}</p>
      <div className="mt-2 grid grid-cols-2 gap-2">
        <Button className="min-h-14" onClick={() => { buzz(10); setStartedAt(Date.now()) }}>
          <PlayIcon /> Stopwatch
        </Button>
        <Button variant="primary" className="min-h-14" disabled={!valid || busy} onClick={log}>
          <CheckIcon /> {busy ? 'Saving…' : 'Log it'}
        </Button>
      </div>
    </div>
  )
}
