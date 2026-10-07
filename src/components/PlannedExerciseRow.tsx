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

/** Valid, changed targets from the fields that were edited (invalid or unchanged ones are left out). */
function changedTargets(item: Targets, tracking: string, edits: Partial<FieldText>): Partial<Targets> {
  const patch: Partial<Targets> = {}
  const sets = edits.sets === undefined ? null : parseReps(edits.sets)
  if (tracking !== 'distance' && sets !== null && sets <= MAX_TARGET_SETS && sets !== item.target_sets) patch.target_sets = sets
  const reps = edits.reps === undefined ? null : parseReps(edits.reps)
  if (tracking === 'reps' && reps !== null && reps <= MAX_TARGET_REPS && reps !== item.target_reps) patch.target_reps = reps
  if (tracking !== 'reps' && edits.time !== undefined) {
    const seconds = parseDuration(edits.time, tracking === 'distance' ? 'minutes' : 'seconds')
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
  // Only what has been typed is held here; untouched fields show the saved target (so a change synced
  // from another device shows up, and is never overwritten by stale text).
  const [edits, setEdits] = useState<Partial<FieldText>>({})
  const saved = textOf(item, tracking)
  const text: FieldText = { sets: edits.sets ?? saved.sets, reps: edits.reps ?? saved.reps, time: edits.time ?? saved.time }
  const edit = (key: keyof FieldText) => (value: string) => setEdits((prev) => ({ ...prev, [key]: value }))
  /** Forget typed text once it is saved (or given up on); a later edit starts again. */
  const settle = (done: Partial<FieldText>) =>
    setEdits((prev) => {
      const next = { ...prev }
      for (const key of Object.keys(done) as (keyof FieldText)[]) if (next[key] === done[key]) delete next[key]
      return next
    })

  // Besides on blur, a valid change is saved once typing pauses and when the row goes away: on iPhone,
  // tapping a button (like Begin) doesn't always take the focus off the field, so blur never came.
  const latest = useRef({ item, tracking, onChange, edits })
  useLayoutEffect(() => {
    latest.current = { item, tracking, onChange, edits }
  })
  // Removing a row drops what was typed in it: saving that on the way out would put the exercise back
  // (or fail, for a routine row that is already gone).
  const remove = () => {
    latest.current = { ...latest.current, edits: {} }
    setEdits({})
    onRemove()
  }
  const saveTyped = () => {
    const { item: current, tracking: kind, onChange: save, edits: typed } = latest.current
    const patch = changedTargets(current, kind, typed)
    if (Object.keys(patch).length === 0) return undefined
    return Promise.resolve(save(patch)).then(() => settle(typed))
  }
  usePendingEdit(saveTyped)
  useEffect(() => {
    if (Object.keys(edits).length === 0) return
    const timer = setTimeout(saveTyped, SAVE_AFTER_MS)
    return () => clearTimeout(timer)
  }, [edits]) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => () => void saveTyped(), []) // eslint-disable-line react-hooks/exhaustive-deps

  // Commit on blur: a valid changed value is saved; an invalid one (or no change) goes back to what is saved.
  function commit(key: keyof FieldText) {
    const typed = edits[key]
    if (typed === undefined) return
    const patch = changedTargets(item, tracking, { [key]: typed })
    if (Object.keys(patch).length > 0) void Promise.resolve(onChange(patch)).then(() => settle({ [key]: typed }))
    else settle({ [key]: typed })
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
          {tracking !== 'distance' && field(tracking === 'reps' ? 'Sets' : exercise?.category === 'yoga' || exercise?.category === 'stretch' ? 'Holds' : 'Rounds', text.sets, edit('sets'), () => commit('sets'))}
          {tracking !== 'distance' && <span className="pb-3 font-bold text-muted" aria-hidden="true">×</span>}
          {tracking === 'reps' && field('Reps', text.reps, edit('reps'), () => commit('reps'))}
          {tracking === 'time' && field('Length', text.time, edit('time'), () => commit('time'), 'w-24', 'text')}
          {tracking === 'distance' && field('Minutes', text.time, edit('time'), () => commit('time'), 'w-24')}
        </div>
        <div className="flex gap-1.5">
          <button type="button" className="icon-button" disabled={isFirst} onClick={() => onMove(-1)} aria-label={`Move ${name} up`}>
            <ArrowUpIcon />
          </button>
          <button type="button" className="icon-button" disabled={isLast} onClick={() => onMove(1)} aria-label={`Move ${name} down`}>
            <ArrowDownIcon />
          </button>
          <button type="button" className="icon-button !text-danger" onClick={remove} aria-label={`Remove ${name}`}>
            <TrashIcon />
          </button>
        </div>
      </div>
    </li>
  )
}
