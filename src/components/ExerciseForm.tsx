import { useState, type FormEvent } from 'react'
import type { ExerciseInput } from '../data/exercises'
import { errorMessage } from '../data/unwrap'
import { CATEGORY_INFO, CATEGORY_ORDER, DEFAULT_TRACKING, TRACKING_LABEL } from '../lib/activity'
import { muscleLabel } from '../lib/format'
import { EQUIPMENT, TRACKINGS, type Category, type Equipment, type Exercise, type Muscle, type Tracking } from '../types/db'
import { Button } from './Button'
import { CategoryTile } from './CategoryTile'
import { MusclePicker } from './MusclePicker'

interface Props {
  initial?: Exercise
  submitLabel: string
  defaultCategory?: Category
  onSubmit: (input: ExerciseInput) => Promise<void>
  onCancel: () => void
}

export function ExerciseForm({ initial, submitLabel, defaultCategory, onSubmit, onCancel }: Props) {
  const startCategory = initial?.category ?? defaultCategory ?? 'strength'
  const [name, setName] = useState(initial?.name ?? '')
  const [category, setCategory] = useState<Category>(startCategory)
  const [tracking, setTracking] = useState<Tracking>(initial?.tracking ?? DEFAULT_TRACKING[startCategory])
  const [primary, setPrimary] = useState<Muscle[]>(initial?.primary_muscles ?? [])
  const [secondary, setSecondary] = useState<Muscle[]>(initial?.secondary_muscles ?? [])
  const [equipment, setEquipment] = useState<Equipment>(initial?.equipment ?? (startCategory === 'strength' ? 'barbell' : 'bodyweight'))
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Lifts need a muscle for the muscle map; a run or a savasana doesn't.
  const valid = name.trim().length > 0 && (tracking !== 'reps' || primary.length > 0)

  function chooseCategory(next: Category) {
    setCategory(next)
    if (!initial) setTracking(DEFAULT_TRACKING[next])
  }

  async function submit(e: FormEvent) {
    e.preventDefault()
    if (!valid) return
    setBusy(true)
    setError(null)
    try {
      await onSubmit({ name, category, tracking, primary_muscles: primary, secondary_muscles: secondary, equipment })
    } catch (err) {
      setError(errorMessage(err))
      setBusy(false)
    }
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <label className="block">
        <span className="mb-1.5 block text-sm font-semibold text-muted">Name</span>
        <input value={name} onChange={(e) => setName(e.target.value)} maxLength={80} required placeholder="e.g. Hill sprints" className="field" />
      </label>

      <fieldset>
        <legend className="mb-2 text-sm font-semibold text-muted">What kind of activity?</legend>
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
          {CATEGORY_ORDER.map((c) => (
            <button
              key={c}
              type="button"
              aria-pressed={category === c}
              onClick={() => chooseCategory(c)}
              className={`flex cursor-pointer flex-col items-center gap-1 rounded-2xl border px-1 py-2 text-xs font-bold transition-colors ${
                category === c ? 'border-accent bg-accent/10 text-text' : 'border-line bg-surface-2 text-muted'
              }`}
            >
              <CategoryTile category={c} size={2.25} />
              {CATEGORY_INFO[c].short}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="mb-2 text-sm font-semibold text-muted">How do you log it?</legend>
        <div className="segmented" role="group">
          {TRACKINGS.map((t) => (
            <button key={t} type="button" aria-pressed={tracking === t} onClick={() => setTracking(t)}>
              {TRACKING_LABEL[t]}
            </button>
          ))}
        </div>
      </fieldset>

      <MusclePicker
        label={tracking === 'reps' ? 'Main muscles (pick at least one)' : 'Main muscles (optional)'}
        value={primary}
        onChange={(v) => {
          setPrimary(v)
          setSecondary((s) => s.filter((m) => !v.includes(m)))
        }}
      />
      <MusclePicker label="Also works" value={secondary} onChange={setSecondary} hide={primary} />

      <label className="block">
        <span className="mb-1.5 block text-sm font-semibold text-muted">Equipment</span>
        <select value={equipment} onChange={(e) => setEquipment(e.target.value as Equipment)} className="field">
          {EQUIPMENT.map((eq) => (
            <option key={eq} value={eq}>
              {muscleLabel(eq)}
            </option>
          ))}
        </select>
      </label>

      {error && <p className="text-sm text-danger">{error}</p>}
      <div className="grid grid-cols-1 gap-2 min-[360px]:grid-cols-2">
        <Button onClick={onCancel} disabled={busy}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" disabled={!valid || busy}>
          {busy ? 'Saving…' : submitLabel}
        </Button>
      </div>
    </form>
  )
}
