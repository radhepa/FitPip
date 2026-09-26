import type { CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import type { SetPatch } from '../data/sets'
import { CATEGORY_INFO, describeTarget } from '../lib/activity'
import { formatEntry, formatSetList, formatWeight } from '../lib/format'
import { suggestNextSet } from '../lib/prefill'
import { distanceInput, lengthUnitFor } from '../lib/units'
import type { PlanItem } from '../lib/workoutBlocks'
import type { DistanceUnit, Exercise, SetRow, WeightUnit } from '../types/db'
import { CategoryTile } from './CategoryTile'
import { DistanceEntry } from './DistanceEntry'
import { LoggedSet } from './LoggedSet'
import { RepsEntry } from './RepsEntry'
import { TallyMarks } from './TallyMarks'
import { TimeEntry } from './TimeEntry'

export interface NewEntry {
  weight: number
  reps: number
  rpe: number | null
  durationSeconds: number | null
  distanceM: number | null
}

interface Props {
  exercise: Exercise
  sets: SetRow[]
  /** The target set up for this exercise, if it was planned. */
  plan: PlanItem | null
  unit: WeightUnit
  distanceUnit: DistanceUnit
  /** Sets from the last earlier workout that included this exercise (empty if never done). */
  lastSessionSets: SetRow[]
  index: number
  onLog: (entry: NewEntry) => Promise<void>
  onEditSet: (id: string, patch: Partial<SetPatch>) => Promise<void>
  onDeleteSet: (id: string) => Promise<void>
  /** Offered while the exercise has no sets yet. */
  onRemove?: () => void
}

const NOUN = { combat: 'Round', cardio: 'Round', yoga: 'Hold', stretch: 'Hold', swim: 'Set', strength: 'Set', sport: 'Round' } as const

/** One exercise or activity in the workout: what was logged, and the right way to log the next one. */
export function ExerciseBlock({ exercise, sets, plan, unit, distanceUnit, lastSessionSets, index, onLog, onEditSet, onDeleteSet, onRemove }: Props) {
  const color = CATEGORY_INFO[exercise.category].color
  const lengthUnit = lengthUnitFor(exercise.category, distanceUnit)
  const target = plan ? { targetSets: plan.targetSets, targetReps: plan.targetReps, targetSeconds: plan.targetSeconds ?? null } : null
  const last = sets.at(-1) ?? lastSessionSets[0]
  const lastTime =
    lastSessionSets.length === 0 ? null : exercise.tracking === 'reps' ? formatSetList(lastSessionSets, unit) : lastSessionSets.slice(0, 3).map((s) => formatEntry(s, unit, lengthUnit)).join(' · ')

  const next = suggestNextSet({ loggedSets: sets, lastSessionSets, targetReps: plan?.targetReps ?? null })
  const initialWeight = next.weight === null ? '' : formatWeight(next.weight)
  const initialReps = next.reps === null ? '' : String(next.reps)
  const setNumber = sets.length + 1

  return (
    <section className="card card-tint mb-3 p-3.5" style={{ '--tint': color, '--i': index } as CSSProperties}>
      <div className="flex items-start gap-3">
        <CategoryTile category={exercise.category} />
        <div className="min-w-0 flex-1">
          <Link to={`/exercises/${exercise.id}`} className="block truncate font-display text-[1.3rem] leading-tight font-extrabold">
            {exercise.name}
          </Link>
          <p className="text-sm font-semibold" style={{ color }}>
            {target ? `Target ${describeTarget(exercise, target)}` : CATEGORY_INFO[exercise.category].label}
          </p>
          {lastTime && <p className="truncate text-xs text-muted">Last time: {lastTime}</p>}
        </div>
        {exercise.tracking !== 'distance' && <TallyMarks completed={sets.length} target={plan?.targetSets} />}
        {onRemove && sets.length === 0 && (
          <button type="button" onClick={onRemove} aria-label={`Remove ${exercise.name}`} className="icon-button !size-9 text-muted">
            ×
          </button>
        )}
      </div>

      {sets.length > 0 && (
        <div className="mt-2">
          {sets.map((set, i) => (
            <LoggedSet key={set.id} index={i + 1} set={set} tracking={exercise.tracking} unit={unit} lengthUnit={lengthUnit} onSave={(patch) => onEditSet(set.id, patch)} onDelete={() => onDeleteSet(set.id)} />
          ))}
        </div>
      )}

      {/* Each entry remounts after a log, so the next one starts from what was just done. */}
      {exercise.tracking === 'reps' && (
        <RepsEntry
          key={`${sets.length}:${initialWeight}:${initialReps}`}
          unit={unit}
          initialWeight={initialWeight}
          initialReps={initialReps}
          setNumber={setNumber}
          onLog={(weight, reps, rpe) => onLog({ weight, reps, rpe, durationSeconds: null, distanceM: null })}
        />
      )}
      {exercise.tracking === 'time' && (
        <TimeEntry
          key={sets.length}
          initialSeconds={last?.duration_seconds ?? plan?.targetSeconds ?? 30}
          noun={NOUN[exercise.category]}
          setNumber={setNumber}
          color={color}
          onLog={(seconds) => onLog({ weight: 0, reps: 0, rpe: null, durationSeconds: seconds, distanceM: null })}
        />
      )}
      {exercise.tracking === 'distance' && (
        <DistanceEntry
          key={sets.length}
          initialSeconds={sets.length === 0 ? (plan?.targetSeconds ?? null) : null}
          initialDistance={sets.length === 0 && lastSessionSets[0]?.distance_m ? distanceInput(lastSessionSets[0].distance_m, lengthUnit) : ''}
          lengthUnit={lengthUnit}
          onLog={(seconds, metres) => onLog({ weight: 0, reps: 0, rpe: null, durationSeconds: seconds, distanceM: metres })}
        />
      )}
    </section>
  )
}
