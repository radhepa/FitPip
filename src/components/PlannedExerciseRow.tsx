import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react'
import { usePendingEdit } from '../hooks/usePendingEdit'
import { CATEGORY_INFO } from '../lib/activity'
import { exerciseSubtitle } from '../lib/exerciseSearch'
import { parseDuration, parseReps } from '../lib/parse'
import { MAX_TARGET_REPS, MAX_TARGET_SETS } from '../lib/sessionPlan'
import { clockText } from '../lib/steps'
import type { Exercise, TemplateExercise } from '../types/db'
import { CategoryTile } from './CategoryTile'
import { smallInputClass } from './fieldStyles'
import { selectAll } from './fx'
import { ArrowDownIcon, ArrowUpIcon, TrashIcon } from './icons'

type Targets = Pick<TemplateExercise, 'target_sets' | 'target_reps'> & { target_seconds?: number | null }

/** Typing pauses this long before a valid change is saved. */
const SAVE_AFTER_MS = 700

type FieldText = { sets: string; reps: string; time: string }

/** How the saved targets read in the fields. */
function textOf(item: Targets, tracking: string): FieldText {
  const seconds = item.target_seconds
  return {
    sets: String(item.target_sets),
    reps: String(item.target_reps),
    time: seconds ? (tracking === 'distance' ? String(Math.round(seconds / 60)) : clockText(seconds)) : '',
  }
}

/** Valid targets from the fields that were edited (untouched, invalid or unchanged ones are left out). */
function changedTargets(item: Targets, tracking: string, text: FieldText): Partial<Targets> {
  const saved = textOf(item, tracking)
  const patch: Partial<Targets> = {}
  const sets = parseReps(text.sets)
  if (text.sets !== saved.sets && tracking !== 'distance' && sets !== null && sets <= MAX_TARGET_SETS && sets !== item.target_sets) patch.target_sets = sets
  const reps = parseReps(text.reps)
  if (text.reps !== saved.reps && tracking === 'reps' && reps !== null && reps <= MAX_TARGET_REPS && reps !== item.target_reps) patch.target_reps = reps
  if (text.time !== saved.time && tracking !== 'reps') {
    const seconds = parseDuration(text.time, tracking === 'distance' ? 'minutes' : 'seconds')
    if (seconds !== null && seconds !== item.target_seconds) patch.target_seconds = seconds
  }
  return patch
}

interface Props {
  item: Targets
  exercise: Exercise | undefined
  isFirst: boolean
  isLast: boolean
  index?: number
  /** May return the save, so Begin / Start can wait for it. */
  onChange: (patch: Partial<Targets>) => void | Promise<void>
  onMove: (direction: -1 | 1) => void
  onRemove: () => void
}

/** One planned exercise (in a routine or a workout being set up): its target, plus reorder and remove. */
export function PlannedExerciseRow({ item, exercise, isFirst, isLast, index = 0, onChange, onMove, onRemove }: Props) {
  const tracking = exercise?.tracking ?? 'reps'
  const [sets, setSets] = useState(() => textOf(item, tracking).sets)
  const [reps, setReps] = useState(() => textOf(item, tracking).reps)
  const [time, setTime] = useState(() => textOf(item, tracking).time)

  // Besides on blur, a valid change is saved once typing pauses and when the row goes away: on iPhone,
  // tapping a button (like Begin) doesn't always take the focus off the field, so blur never came.
  const latest = useRef({ item, tracking, onChange, text: { sets, reps, time } })
  useLayoutEffect(() => {
    latest.current = { item, tracking, onChange, text: { sets, reps, time } }
  })
  const saveTyped = () => {
    const { item: current, tracking: kind, onChange: save, text } = latest.current
    const patch = changedTargets(current, kind, text)
    return Object.keys(patch).length > 0 ? save(patch) : undefined
  }
  usePendingEdit(saveTyped)
  useEffect(() => {
    const timer = setTimeout(saveTyped, SAVE_AFTER_MS)
    return () => clearTimeout(timer)
  }, [sets, reps, time]) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => () => void saveTyped(), []) // eslint-disable-line react-hooks/exhaustive-deps

  // Commit on blur: a valid changed value is saved, an invalid one snaps back to what is saved.
  function commit(field: keyof FieldText) {
    const text = { sets, reps, time }
    const patch = changedTargets(item, tracking, text)
    const key = field === 'sets' ? 'target_sets' : field === 'reps' ? 'target_reps' : 'target_seconds'
    if (key in patch) return onChange({ [key]: patch[key] })
    const saved = textOf(item, tracking)
    const valid = field === 'time' ? parseDuration(time, tracking === 'distance' ? 'minutes' : 'seconds') !== null : parseReps(text[field]) !== null && Number(text[field]) <= (field === 'sets' ? MAX_TARGET_SETS : MAX_TARGET_REPS)
    if (!valid) (field === 'sets' ? setSets : field === 'reps' ? setReps : setTime)(saved[field])
  }

  const name = exercise?.name ?? 'Unknown exercise'
  const color = exercise ? CATEGORY_INFO[exercise.category].color : 'var(--color-accent)'
  const field = (label: string, value: string, set: (v: string) => void, commit: () => void, width = 'w-20', mode: 'numeric' | 'text' = 'numeric') => (
    <label className="block">
      <span className="mb-1 block text-[.7rem] font-bold text-muted">{label}</span>
      <input inputMode={mode} value={value} onFocus={selectAll} onChange={(e) => set(e.target.value)} onBlur={commit} aria-label={`${label} for ${name}`} className={`${smallInputClass} ${width}`} />
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
          {tracking !== 'distance' && field(tracking === 'reps' ? 'Sets' : exercise?.category === 'yoga' || exercise?.category === 'stretch' ? 'Holds' : 'Rounds', sets, setSets, () => commit('sets'))}
          {tracking !== 'distance' && <span className="pb-3 font-bold text-muted" aria-hidden="true">×</span>}
          {tracking === 'reps' && field('Reps', reps, setReps, () => commit('reps'))}
          {tracking === 'time' && field('Length', time, setTime, () => commit('time'), 'w-24', 'text')}
          {tracking === 'distance' && field('Minutes', time, setTime, () => commit('time'), 'w-24')}
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
