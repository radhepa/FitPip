import { useMemo, useState } from 'react'
import { computeVolume, workFromPlan } from '../lib/muscleVolume'
import { planFromSuggestion } from '../lib/workoutBlocks'
import type { Exercise, WeightUnit } from '../types/db'
import type { SuggestionResult } from '../types/suggestion'
import { Button } from './Button'
import { inputClass } from './fieldStyles'
import { MuscleVolumePanel } from './MuscleVolumePanel'

interface Props {
  result: SuggestionResult
  exercises: Exercise[]
  unit: WeightUnit
  starting: boolean
  saving: boolean
  error: string | null
  onStart: (name: string) => void
  onSave: (name: string) => void
}

/** A suggested workout with what it trains, and the two ways to take it: start it now, or keep it as a template. */
export function SuggestionCard({ result, exercises, unit, starting, saving, error, onStart, onSave }: Props) {
  const { suggestion, model } = result
  const [name, setName] = useState(suggestion.name)
  const volume = useMemo(
    () => computeVolume(workFromPlan(planFromSuggestion(suggestion), new Map(exercises.map((e) => [e.id, e])))),
    [suggestion, exercises],
  )
  const busy = starting || saving
  const finalName = name.trim() || suggestion.name

  return (
    <>
      <section className="mb-8 border-b border-line pb-8">
        <span className="section-label">Suggested for today</span>
        <label className="mb-3 block">
          <span className="sr-only">Workout name</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={80}
            aria-label="Workout name"
            className={`${inputClass} text-xl`}
          />
        </label>
        <p className="m-0 mb-4 text-sm text-muted">{suggestion.rationale}</p>

        <ol className="m-0 mb-5 grid list-none grid-cols-1 gap-2 p-0">
          {suggestion.exercises.map((e, index) => (
            <li key={e.exercise_id} className="flex items-baseline gap-3 border-t border-line py-3">
              <span className="w-5 shrink-0 text-sm text-muted">{index + 1}</span>
              <div className="min-w-0 flex-1">
                <p className="m-0 truncate font-bold">{e.name}</p>
                {e.note && <p className="m-0 text-sm text-muted">{e.note}</p>}
              </div>
              <span className="shrink-0 font-bold">
                {e.target_sets} × {e.target_reps}
              </span>
            </li>
          ))}
        </ol>

        <div className="grid grid-cols-1 gap-2">
          <Button variant="primary" block disabled={busy} onClick={() => onStart(finalName)}>
            {starting ? 'Opening…' : 'Use this workout'}
          </Button>
          <Button block disabled={busy} onClick={() => onSave(finalName)}>
            {saving ? 'Saving…' : 'Save as a template'}
          </Button>
        </div>
        {error && <p className="mt-3 mb-0 text-sm text-danger">{error}</p>}
        <p className="m-0 mt-3 text-xs text-muted">You can adjust the exercises before you begin, and your last weights are filled in. Model: {model}.</p>
      </section>

      <MuscleVolumePanel
        label="Planned volume"
        title="What it trains"
        caption="Target sets per muscle in this workout."
        volume={volume}
        unit={unit}
        periodLabel="this workout"
      />
    </>
  )
}
