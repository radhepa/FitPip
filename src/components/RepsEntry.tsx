import { useState } from 'react'
import { formatWeight } from '../lib/format'
import { parseReps, parseWeight } from '../lib/parse'
import { RPE_CHOICES, stepNumber } from '../lib/steps'
import type { WeightUnit } from '../types/db'
import { Button } from './Button'
import { CheckIcon } from './icons'
import { Stepper } from './Stepper'

interface Props {
  unit: WeightUnit
  initialWeight: string
  initialReps: string
  setNumber: number
  onLog: (weight: number, reps: number, rpe: number | null) => Promise<void>
}

/** Weight and reps with steppers, optional RPE chips and a big "Log set" button. Remount to reset. */
export function RepsEntry({ unit, initialWeight, initialReps, setNumber, onLog }: Props) {
  const [weight, setWeight] = useState(initialWeight)
  const [reps, setReps] = useState(initialReps)
  const [rpe, setRpe] = useState<number | null>(null)
  const [busy, setBusy] = useState(false)

  const parsedWeight = parseWeight(weight)
  const parsedReps = parseReps(reps)
  const valid = parsedWeight !== null && parsedReps !== null
  const plateStep = unit === 'kg' ? 2.5 : 5

  async function log() {
    if (parsedWeight === null || parsedReps === null || busy) return
    setBusy(true)
    try {
      await onLog(parsedWeight, parsedReps, rpe)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mt-3">
      <div className="grid grid-cols-2 gap-2">
        <Stepper
          label={`Weight · ${unit}`}
          value={weight}
          onChange={setWeight}
          onStep={(d) => setWeight(stepNumber(weight, d * plateStep))}
          invalid={parsedWeight === null}
          ariaLabel={`Weight in ${unit}`}
        />
        <Stepper label="Reps" value={reps} inputMode="numeric" onChange={setReps} onStep={(d) => setReps(stepNumber(reps, d, 1))} invalid={reps !== '' && parsedReps === null} />
      </div>
      <div className="chip-row mt-2" role="group" aria-label="Effort (RPE), optional">
        <span className="flex-none self-center text-xs font-bold text-muted">RPE</span>
        {RPE_CHOICES.map((value) => (
          <button key={value} type="button" className="filter-chip !min-h-8 !px-2.5" aria-pressed={rpe === value} onClick={() => setRpe(rpe === value ? null : value)}>
            {formatWeight(value)}
          </button>
        ))}
      </div>
      <Button variant="primary" block className="mt-2 min-h-14 text-lg" disabled={!valid || busy} onClick={log}>
        <CheckIcon /> {busy ? 'Saving…' : `Log set ${setNumber}`}
      </Button>
    </div>
  )
}
