import { useState, type CSSProperties } from 'react'
import { CATEGORY_INFO } from '../lib/activity'
import { exerciseSubtitle } from '../lib/exerciseSearch'
import { parseDuration, parseReps } from '../lib/parse'
import { MAX_TARGET_REPS, MAX_TARGET_SETS } from '../lib/sessionPlan'
import { clockText } from '../lib/steps'
import type { Exercise, TemplateExercise } from '../types/db'
import { CategoryTile } from './CategoryTile'
import { smallInputClass } from './fieldStyles'
import { ArrowDownIcon, ArrowUpIcon, TrashIcon } from './icons'

type Targets = Pick<TemplateExercise, 'target_sets' | 'target_reps'> & { target_seconds?: number | null }

interface Props {
  item: Targets
  exercise: Exercise | undefined
  isFirst: boolean
  isLast: boolean
  index?: number
  onChange: (patch: Partial<Targets>) => void
  onMove: (direction: -1 | 1) => void
  onRemove: () => void
}

/** One planned exercise (in a routine or a workout being set up): its target, plus reorder and remove. */
export function PlannedExerciseRow({ item, exercise, isFirst, isLast, index = 0, onChange, onMove, onRemove }: Props) {
  const tracking = exercise?.tracking ?? 'reps'
  const [sets, setSets] = useState(String(item.target_sets))
  const [reps, setReps] = useState(String(item.target_reps))
  const [time, setTime] = useState(item.target_seconds ? (tracking === 'distance' ? String(Math.round(item.target_seconds / 60)) : clockText(item.target_seconds)) : '')

  // Commit on blur: a valid changed value is saved, an invalid one snaps back.
  function commitCount(field: 'target_sets' | 'target_reps', text: string, max: number) {
    const value = parseReps(text)
    const current = item[field]
    if (value === null || value > max) return field === 'target_sets' ? setSets(String(current)) : setReps(String(current))
    if (value !== current) onChange({ [field]: value })
  }
  function commitTime() {
    const seconds = parseDuration(time, tracking === 'distance' ? 'minutes' : 'seconds')
    if (seconds === null) return setTime(item.target_seconds ? clockText(item.target_seconds) : '')
    if (seconds !== item.target_seconds) onChange({ target_seconds: seconds })
  }

  const name = exercise?.name ?? 'Unknown exercise'
  const color = exercise ? CATEGORY_INFO[exercise.category].color : 'var(--color-accent)'
  const field = (label: string, value: string, set: (v: string) => void, commit: () => void, width = 'w-20', mode: 'numeric' | 'text' = 'numeric') => (
    <label className="block">
      <span className="mb-1 block text-[.7rem] font-bold text-muted">{label}</span>
      <input inputMode={mode} value={value} onChange={(e) => set(e.target.value)} onBlur={commit} aria-label={`${label} for ${name}`} className={`${smallInputClass} ${width}`} />
    </label>
  )

  return (
    <li className="card card-tint p-3" style={{ '--tint': color, '--i': index } as CSSProperties}>
      <div className="mb-3 flex items-center gap-3">
        {exercise && <CategoryTile category={exercise.category} size={2.5} />}
        <div className="min-w-0 flex-1">
          <p className="truncate font-extrabold">{name}</p>
          {exercise && <p className="truncate text-sm text-muted">{exerciseSubtitle(exercise)}</p>}
        </div>
      </div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex items-end gap-2">
          {tracking !== 'distance' && field(tracking === 'reps' ? 'Sets' : exercise?.category === 'yoga' || exercise?.category === 'stretch' ? 'Holds' : 'Rounds', sets, setSets, () => commitCount('target_sets', sets, MAX_TARGET_SETS))}
          {tracking !== 'distance' && <span className="pb-3 font-bold text-muted" aria-hidden="true">×</span>}
          {tracking === 'reps' && field('Reps', reps, setReps, () => commitCount('target_reps', reps, MAX_TARGET_REPS))}
          {tracking === 'time' && field('Length', time, setTime, commitTime, 'w-24', 'text')}
          {tracking === 'distance' && field('Minutes', time, setTime, commitTime, 'w-24')}
        </div>
        <div className="flex gap-1.5">
          <button type="button" className="icon-button" disabled={isFirst} onClick={() => onMove(-1)} aria-label={`Move ${name} up`}>
            <ArrowUpIcon />
          </button>
          <button type="button" className="icon-button" disabled={isLast} onClick={() => onMove(1)} aria-label={`Move ${name} down`}>
            <ArrowDownIcon />
          </button>
          <button type="button" className="icon-button !text-danger" onClick={onRemove} aria-label={`Remove ${name}`}>
            <TrashIcon />
          </button>
        </div>
      </div>
    </li>
  )
}
