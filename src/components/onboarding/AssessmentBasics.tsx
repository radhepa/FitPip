import type { AssessmentDraft } from '../../lib/assessmentDraft'
import { changeAssessmentUnit } from '../../lib/assessmentDraft'

export function AssessmentBasics({ value, onChange }: { value: AssessmentDraft; onChange: (value: AssessmentDraft) => void }) {
  return <div className="grid grid-cols-1 gap-5">
    <div className="grid grid-cols-2 gap-3">
      <label className="text-sm font-bold">Age
        <input className="field mt-2" type="number" inputMode="numeric" min="1" max="120" step="1" required placeholder="Years"
          value={value.age} onChange={(e) => onChange({ ...value, age: e.target.value })} />
      </label>
      <label className="text-sm font-bold">Bodyweight ({value.unit})
        <input className="field mt-2" type="number" inputMode="decimal" min="0.01" max="1999.99" step="0.01" required placeholder={value.unit}
          value={value.bodyweight} onChange={(e) => onChange({ ...value, bodyweight: e.target.value })} />
      </label>
    </div>
    <fieldset className="m-0 min-w-0 border-0 p-0">
      <legend className="mb-2 text-sm font-bold">Units for this assessment</legend>
      <div className="segmented">
        {(['lb', 'kg'] as const).map((unit) => <button type="button" key={unit} aria-pressed={value.unit === unit}
          onClick={() => onChange(changeAssessmentUnit(value, unit))}>{unit === 'lb' ? 'Pounds · lb' : 'Kilograms · kg'}</button>)}
      </div>
    </fieldset>
    <fieldset className="m-0 min-w-0 border-0 p-0">
      <legend className="mb-2 text-sm font-bold">Compare my lifts with</legend>
      <div className="segmented">
        {(['male', 'female'] as const).map((sex) => <button type="button" key={sex} aria-pressed={value.sex === sex}
          onClick={() => onChange({ ...value, sex })}>{sex === 'male' ? 'Men’s standards' : 'Women’s standards'}</button>)}
      </div>
      <p className="mt-2 text-xs text-muted">Choose a comparison to calculate your rank. You can change it later in Profile.</p>
    </fieldset>
    <p className="rounded-xl bg-surface-2 p-3 text-xs text-muted">Your rank uses bodyweight and the strength standards you choose. Age is saved with your answers; this version doesn’t adjust ranks by age.</p>
  </div>
}
