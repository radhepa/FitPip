import { useState } from 'react'
import type { SetPatch } from '../data/sets'
import { formatEntry, formatWeight } from '../lib/format'
import { parseDistance, parseDuration, parseReps, parseRpe, parseWeight } from '../lib/parse'
import { clockText } from '../lib/steps'
import { distanceInput, toMetres, type LengthUnit } from '../lib/units'
import type { SetRow, Tracking, WeightUnit } from '../types/db'
import { Button } from './Button'
import { CheckIcon } from './icons'

interface Props {
  index: number
  set: SetRow
  tracking: Tracking
  unit: WeightUnit
  lengthUnit: LengthUnit
  onSave: (patch: Partial<SetPatch>) => Promise<void>
  onDelete: () => Promise<void>
}

const inputClass = 'field !min-h-11 text-center font-bold'

/** One logged set, hold or effort. Tap to edit or delete it. */
export function LoggedSet({ index, set, tracking, unit, lengthUnit, onSave, onDelete }: Props) {
  const [editing, setEditing] = useState(false)
  const [a, setA] = useState('')
  const [b, setB] = useState('')
  const [c, setC] = useState('')
  const [busy, setBusy] = useState(false)

  function startEditing() {
    if (tracking === 'reps') {
      setA(formatWeight(set.weight))
      setB(String(set.reps))
      setC(set.rpe === null ? '' : formatWeight(set.rpe))
    } else {
      setA(set.duration_seconds ? clockText(set.duration_seconds) : '')
      setB(set.distance_m ? distanceInput(set.distance_m, lengthUnit) : '')
    }
    setEditing(true)
  }

  const patch: Partial<SetPatch> | null = (() => {
    if (tracking === 'reps') {
      const weight = parseWeight(a)
      const reps = parseReps(b)
      const rpe = parseRpe(c)
      return weight !== null && reps !== null && rpe.ok ? { weight, reps, rpe: rpe.value } : null
    }
    const seconds = a.trim() === '' ? null : parseDuration(a, tracking === 'distance' ? 'minutes' : 'seconds')
    if (a.trim() !== '' && seconds === null) return null
    const distance = tracking === 'distance' ? parseDistance(b) : null
    if (distance === undefined) return null
    const metres = distance ? toMetres(distance, lengthUnit) : null
    return seconds === null && metres === null ? null : { duration_seconds: seconds, distance_m: metres }
  })()

  async function run(action: () => Promise<void>) {
    setBusy(true)
    try {
      await action()
      setEditing(false)
    } finally {
      setBusy(false)
    }
  }

  if (!editing) {
    return (
      <button
        type="button"
        onClick={startEditing}
        className="logged-set-row flex min-h-12 w-full cursor-pointer items-center gap-3 rounded-xl px-2 text-left hover:bg-surface-2"
      >
        <span className="grid size-7 shrink-0 place-items-center rounded-full bg-target/15 text-target" aria-hidden="true">
          <CheckIcon size="size-4" />
        </span>
        <span className="w-5 text-sm font-bold text-muted">{index}</span>
        <span className="min-w-0 flex-1 truncate font-bold">{formatEntry(set, unit, lengthUnit)}</span>
        <span className="text-xs font-semibold text-muted">Edit</span>
      </button>
    )
  }

  const labels = tracking === 'reps' ? [`Weight (${unit})`, 'Reps', 'RPE'] : tracking === 'distance' ? ['Time', `Distance (${lengthUnit})`] : ['Length (m:ss)']
  const values = [a, b, c]
  const setters = [setA, setB, setC]
  return (
    <div className="my-1 rounded-2xl border border-line bg-bg p-2.5">
      <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${labels.length}, minmax(0, 1fr))` }}>
        {labels.map((label, i) => (
          <label key={label} className="block">
            <span className="mb-1 block text-center text-[.7rem] font-bold text-muted">{label}</span>
            <input inputMode={i === 0 && tracking !== 'reps' ? 'text' : 'decimal'} value={values[i]} onChange={(e) => setters[i](e.target.value)} aria-label={label} className={inputClass} />
          </label>
        ))}
      </div>
      <div className="mt-2 grid grid-cols-3 gap-2">
        <Button variant="danger" size="sm" disabled={busy} onClick={() => run(onDelete)}>
          Delete
        </Button>
        <Button size="sm" disabled={busy} onClick={() => setEditing(false)}>
          Cancel
        </Button>
        <Button variant="primary" size="sm" disabled={busy || !patch} onClick={() => patch && run(() => onSave(patch))}>
          Save
        </Button>
      </div>
    </div>
  )
}
