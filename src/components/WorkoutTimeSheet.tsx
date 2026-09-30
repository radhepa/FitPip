import { useState } from 'react'
import { errorMessage } from '../data/unwrap'
import { formatDuration, formatTime } from '../lib/format'
import { fromTimeParts, toTimeParts, workoutTimeProblem, type TimeParts } from '../lib/workoutTime'
import { Button } from './Button'
import { inputClass } from './fieldStyles'
import { Sheet } from './Sheet'

interface Props {
  open: boolean
  startedAt: string
  /** Null while the workout is still running: then only its start can change. */
  endedAt: string | null
  /** When the last set in the workout was logged, offered as its finish. */
  lastSetAt?: string | null
  onSave: (startedAt: string, endedAt?: string) => Promise<void>
  onClose: () => void
}

/** Corrects when a workout started and finished (one left running for hours, or begun late). */
export function WorkoutTimeSheet(props: Props) {
  // Mounted only while open, so the fields start from the saved times every time.
  return props.open ? <TimeForm {...props} /> : null
}

function TimeForm({ startedAt, endedAt, lastSetAt = null, onSave, onClose }: Props) {
  const [start, setStart] = useState(() => toTimeParts(startedAt))
  const [end, setEnd] = useState(() => toTimeParts(endedAt ?? startedAt))
  // The exact moment picked with "last set", so it keeps its seconds.
  const [pickedEnd, setPickedEnd] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const finished = endedAt !== null
  const startIso = fromTimeParts(start, startedAt)
  const endIso = finished ? fromTimeParts(end, pickedEnd ?? endedAt) : undefined
  const problem = workoutTimeProblem(startIso, endIso)
  const changed = startIso !== startedAt || (finished && endIso !== endedAt)
  const lastSetFits = finished && lastSetAt !== null && Date.parse(lastSetAt) >= Date.parse(startedAt) && Date.parse(lastSetAt) < Date.parse(endedAt)

  async function save() {
    if (problem || !startIso) return
    if (!changed) return onClose()
    setSaving(true)
    setError(null)
    try {
      await onSave(startIso, endIso ?? undefined)
      onClose()
    } catch (e) {
      setError(errorMessage(e))
      setSaving(false)
    }
  }

  return (
    <Sheet
      open
      title={finished ? 'Workout time' : 'Start time'}
      onClose={onClose}
      footer={
        <Button variant="primary" block disabled={saving || problem !== null} onClick={() => void save()}>
          {saving ? 'Saving…' : 'Save'}
        </Button>
      }
    >
      <TimeFields label="Started" name="Start" value={start} onChange={setStart} />
      {finished && (
        <>
          <TimeFields
            label="Finished"
            name="Finish"
            value={end}
            onChange={(next) => {
              setPickedEnd(null)
              setEnd(next)
            }}
          />
          {lastSetFits && (
            <Button
              variant="tint"
              size="sm"
              className="mt-2"
              aria-pressed={endIso === lastSetAt}
              onClick={() => {
                setPickedEnd(lastSetAt)
                setEnd(toTimeParts(lastSetAt))
              }}
            >
              Finish at the last set · {formatTime(lastSetAt)}
            </Button>
          )}
        </>
      )}

      <div className="mt-5 rounded-2xl bg-bg px-4 py-3" aria-live="polite">
        {problem ? (
          <p className="text-sm font-bold text-danger">{problem}</p>
        ) : finished && startIso && endIso ? (
          <>
            <p className="text-xs font-bold text-muted">Duration</p>
            <p className="font-display text-2xl font-extrabold">{formatDuration(Date.parse(endIso) - Date.parse(startIso))}</p>
            {changed && <p className="text-xs text-muted">Was {formatDuration(Date.parse(endedAt) - Date.parse(startedAt))}</p>}
          </>
        ) : (
          <p className="text-sm text-muted">The clock counts from this time.</p>
        )}
      </div>
      {error && <p className="mt-3 text-sm text-danger">{error}</p>}
    </Sheet>
  )
}

interface FieldsProps {
  label: string
  /** Spoken name of the pair: "Start day", "Start time". */
  name: string
  value: TimeParts
  onChange: (next: TimeParts) => void
}

function TimeFields({ label, name, value, onChange }: FieldsProps) {
  return (
    <fieldset className="mt-4 min-w-0 first:mt-0">
      <legend className="mb-1.5 text-sm font-extrabold">{label}</legend>
      <div className="grid grid-cols-1 gap-2 min-[340px]:grid-cols-[3fr_2fr]">
        <input
          type="date"
          value={value.date}
          max={toTimeParts(new Date().toISOString()).date}
          onChange={(e) => onChange({ ...value, date: e.target.value })}
          aria-label={`${name} day`}
          className={inputClass}
        />
        <input
          type="time"
          value={value.time}
          onChange={(e) => onChange({ ...value, time: e.target.value })}
          aria-label={`${name} time`}
          className={inputClass}
        />
      </div>
    </fieldset>
  )
}
