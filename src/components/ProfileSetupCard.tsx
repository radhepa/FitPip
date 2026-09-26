import { useState } from 'react'
import { Link } from 'react-router-dom'
import { errorMessage } from '../data/unwrap'
import { useSettings } from '../hooks/useSettings'
import type { Sex, WeightUnit } from '../types/db'
import { CheckIcon, ScaleIcon } from './icons'

interface Props {
  missing: { sex: boolean; bodyweight: boolean }
  bodyweight: number | null
  unit: WeightUnit
}

export const SEX_OPTIONS: { value: Sex; label: string }[] = [
  { value: 'male', label: 'Men’s standards' },
  { value: 'female', label: 'Women’s standards' },
]

/** Shown until lifts can be ranked: pick which standards to compare with, and weigh in. */
export function ProfileSetupCard({ missing, bodyweight, unit }: Props) {
  const { compareSex, setCompareSex } = useSettings()
  const [error, setError] = useState<string | null>(null)

  return (
    <section className="card p-4" aria-labelledby="setup-title">
      <h2 id="setup-title" className="font-display text-lg font-extrabold">
        Get your lifts ranked
      </h2>
      <p className="mt-1 text-sm text-muted">Ranks compare your best lifts with people who lift at your bodyweight. Two things first:</p>

      <div className="mt-4">
        <p className="mb-2 flex items-center gap-2 text-sm font-extrabold">
          {!missing.sex && <CheckIcon size="size-4" />} 1. Compare my lifts with
        </p>
        <div className="segmented" role="group" aria-label="Strength standards">
          {SEX_OPTIONS.map((o) => (
            <button
              key={o.value}
              type="button"
              aria-pressed={compareSex === o.value}
              onClick={() => setCompareSex(o.value).catch((e: unknown) => setError(errorMessage(e)))}
            >
              {o.label}
            </button>
          ))}
        </div>
        {error && <p className="mt-2 text-sm text-danger">{error}</p>}
      </div>

      <div className="mt-4">
        <p className="mb-2 flex items-center gap-2 text-sm font-extrabold">
          {!missing.bodyweight && <CheckIcon size="size-4" />} 2. Your bodyweight
        </p>
        {missing.bodyweight ? (
          <Link to="/weigh-in" className="app-button button-primary w-full">
            <ScaleIcon size="size-5" /> Weigh in
          </Link>
        ) : (
          <p className="text-sm text-muted">
            {bodyweight} {unit} (average of the last week of weigh-ins)
          </p>
        )}
      </div>
    </section>
  )
}
