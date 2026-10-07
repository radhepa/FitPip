import { useState } from 'react'
import { useToday } from '../hooks/useToday'
import type { WeightUnit } from '../types/db'
import { BathroomScale } from './BathroomScale'
import { Button } from './Button'
import { buzz, selectAll } from './fx'
import { CheckIcon } from './icons'
import { RepeatButton } from './RepeatButton'
import { WeightRuler } from './WeightRuler'

interface Props {
  unit: WeightUnit
  /** Where the dial starts (the last weigh-in, or a typical weight). */
  startWeight: number
  /** Dates that already have a weigh-in (saving again replaces it). */
  takenDates: Set<string>
  onSave: (date: string, weight: number) => Promise<void>
}

const round1 = (n: number) => Math.round(n * 10) / 10

/** The scale: dial or type a weight, pick the day, and step on. */
export function WeighInPanel({ unit, startWeight, takenDates, onSave }: Props) {
  const today = useToday()
  const [weight, setWeight] = useState(round1(startWeight))
  const [text, setText] = useState<string | null>(null)
  // The day follows the calendar (the app may be left open overnight) unless an earlier day was picked.
  const [picked, setPicked] = useState<string | null>(null)
  const date = picked !== null && picked < today ? picked : today
  const [busy, setBusy] = useState(false)
  const [steps, setSteps] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const nudge = (delta: number) => {
    buzz(6)
    setText(null)
    setWeight((w) => Math.max(20, round1(w + delta)))
  }

  async function save() {
    setBusy(true)
    setError(null)
    try {
      await onSave(date, weight)
      setSteps((s) => s + 1)
      buzz([30, 40, 30])
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="card card-hero p-4">
      <BathroomScale weight={weight} unit={unit} stepKey={steps} />

      <div className="mt-3 flex items-center justify-center gap-2">
        <RepeatButton className="icon-button" onStep={() => nudge(-1)} aria-label={`1 ${unit} less`}>−1</RepeatButton>
        <RepeatButton className="icon-button" onStep={() => nudge(-0.1)} aria-label={`0.1 ${unit} less`}>−.1</RepeatButton>
        <input
          inputMode="decimal"
          value={text ?? weight.toFixed(1)}
          onFocus={selectAll}
          onChange={(e) => {
            setText(e.target.value)
            const value = Number(e.target.value.replace(',', '.'))
            if (Number.isFinite(value) && value >= 20 && value < 2000) setWeight(round1(value))
          }}
          onBlur={() => setText(null)}
          aria-label={`Weight in ${unit}`}
          className="w-28 rounded-2xl border border-line bg-bg py-1 text-center font-display text-4xl font-extrabold outline-none focus:border-accent"
        />
        <RepeatButton className="icon-button" onStep={() => nudge(0.1)} aria-label={`0.1 ${unit} more`}>+.1</RepeatButton>
        <RepeatButton className="icon-button" onStep={() => nudge(1)} aria-label={`1 ${unit} more`}>+1</RepeatButton>
      </div>

      <div className="mt-3">
        <WeightRuler value={weight} unit={unit} onChange={(v) => { setText(null); setWeight(v) }} />
        <p className="mt-1 text-center text-xs font-semibold text-muted">Drag or flick the ruler, hold a button, or type</p>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <input
          type="date"
          value={date}
          max={today}
          onChange={(e) => e.target.value && setPicked(e.target.value === today ? null : e.target.value)}
          aria-label="Day of the weigh-in"
          className="field !min-h-14 !w-auto shrink-0"
        />
        <Button variant="primary" block className="min-h-14 text-lg whitespace-nowrap" disabled={busy} onClick={save}>
          <CheckIcon /> {busy ? 'Saving…' : takenDates.has(date) ? 'Update' : 'Step on'}
        </Button>
      </div>
      {error && <p className="mt-2 text-sm text-danger">{error}</p>}
    </section>
  )
}
