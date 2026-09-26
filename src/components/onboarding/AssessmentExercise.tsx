import type { ASSESSMENT_EXERCISES } from '../../config/assessment'
import type { AssessmentAnswerDraft } from '../../lib/assessmentDraft'
import type { WeightUnit } from '../../types/db'
import { CheckIcon } from '../icons'

interface Props {
  exercise: (typeof ASSESSMENT_EXERCISES)[number]
  value: AssessmentAnswerDraft
  unit: WeightUnit
  onChange: (value: AssessmentAnswerDraft) => void
}

export function AssessmentExercise({ exercise, value, unit, onChange }: Props) {
  const bodyweight = exercise.kind === 'reps'
  return <div className="grid grid-cols-1 gap-4">
    <div className="grid grid-cols-1 gap-2" role="group" aria-label={`Experience with ${exercise.name}`}>
      {[true, false].map((done) => <button key={String(done)} type="button" aria-pressed={value.done === done}
        className={`welcome-choice ${value.done === done ? 'is-selected' : ''}`} onClick={() => onChange({ ...value, done })}>
        <span className="flex-1 font-bold">{done ? 'I’ve done this' : 'Haven’t done this'}</span>
        {value.done === done && <CheckIcon />}
      </button>)}
    </div>
    {value.done === true && <div className="rounded-2xl border border-line bg-surface-2 p-4">
      <p className="mb-4 text-sm text-muted">{exercise.hint}</p>
      <div className={`grid gap-3 ${bodyweight ? 'grid-cols-1' : 'grid-cols-2'}`}>
        {!bodyweight && <label className="text-sm font-bold">Weight ({unit})
          <input className="field mt-2" type="number" inputMode="decimal" min="0.01" max="1999.99" step="0.01" required placeholder={unit}
            value={value.weight} onChange={(e) => onChange({ ...value, weight: e.target.value })} />
        </label>}
        <label className="text-sm font-bold">{bodyweight ? 'Most reps in one set' : 'Reps at that weight'}
          <input className="field mt-2" type="number" inputMode="numeric" min={bodyweight ? 0 : 1} max={bodyweight ? 200 : 15} step="1" required placeholder="Reps"
            value={value.reps} onChange={(e) => onChange({ ...value, reps: e.target.value })} />
        </label>
      </div>
      <p className="mt-3 text-xs text-muted">{bodyweight ? 'Enter 0 if you’ve tried but can’t complete a full rep yet.' : 'Use your best recent set of 1–15 reps. If you know your one-rep max, enter it with 1 rep.'}</p>
    </div>}
    {value.done === false && <p role="status" className="rounded-2xl bg-surface-2 p-4 text-sm text-muted">No problem. We’ll leave {exercise.name.toLowerCase()} out of your estimate.</p>}
    {value.done === null && <p className="py-4 text-center text-sm text-muted">No need to try a max today. Just tell Pip what you already know.</p>}
  </div>
}
