import { Link } from 'react-router-dom'
import { formatDate, formatSetCount, formatSetList, muscleLabel } from '../lib/format'
import {
  groupSetsByWorkout,
  levelFor,
  type MuscleContribution,
  type VolumeByMuscle,
} from '../lib/muscleVolume'
import { LEVEL_LABELS } from '../config/muscleMap'
import type { Muscle, WeightUnit } from '../types/db'
import { Sheet } from './Sheet'

interface Props {
  open: boolean
  title: string
  /** Our muscles behind the tapped region or chip. */
  muscles: Muscle[]
  volume: VolumeByMuscle
  unit: WeightUnit
  /** Wording for the period, e.g. "the last 30 days" or "this workout". */
  periodLabel: string
  /** Weeks the volume covers; per-week figures are shown when this is not 1. */
  weeks: number
  /** Workout start times, to date each set group (omit for a single workout or a plan). */
  workoutDates?: Map<string, string>
  onClose: () => void
}

interface ExerciseRow {
  contribution: MuscleContribution
  /** Primary if the exercise trains any of the muscles as a primary mover. */
  role: 'primary' | 'secondary'
}

/** Each exercise once, even when it feeds several of the muscles in this region. */
function exerciseRows(muscles: Muscle[], volume: VolumeByMuscle): ExerciseRow[] {
  const rows = new Map<string, ExerciseRow>()
  for (const muscle of muscles) {
    for (const contribution of volume[muscle].contributions) {
      const existing = rows.get(contribution.exercise.id)
      if (!existing) rows.set(contribution.exercise.id, { contribution, role: contribution.role })
      else if (contribution.role === 'primary') existing.role = 'primary'
    }
  }
  return [...rows.values()].sort((a, b) => b.contribution.setCount - a.contribution.setCount)
}

/** Bottom sheet for a tapped muscle: the totals, then each exercise that trained it with its sets. */
export function MuscleSheet({ open, title, muscles, volume, unit, periodLabel, weeks, workoutDates, onClose }: Props) {
  const rows = exerciseRows(muscles, volume)

  return (
    <Sheet open={open} title={title} onClose={onClose}>
      <ul className="m-0 mb-4 grid list-none grid-cols-1 gap-1 p-0">
        {muscles.map((muscle) => {
          const v = volume[muscle]
          return (
            <li key={muscle} className="flex items-baseline justify-between gap-3 text-sm">
              <span className="font-bold">{muscles.length > 1 ? muscleLabel(muscle) : `${formatSetCount(v.weighted)} ${v.weighted === 1 ? 'set' : 'sets'}`}</span>
              <span className="text-muted">
                {muscles.length > 1 && `${formatSetCount(v.weighted)} ${v.weighted === 1 ? 'set' : 'sets'} · `}
                {weeks !== 1 && `${formatSetCount(v.perWeek)} a week · `}
                level {levelFor(v.perWeek)} ({LEVEL_LABELS[levelFor(v.perWeek)]})
              </span>
            </li>
          )
        })}
      </ul>

      {rows.length === 0 ? (
        <p className="m-0 rounded-2xl border border-dashed border-line p-4 text-center text-sm text-muted">
          Nothing trained this in {periodLabel}.
        </p>
      ) : (
        <ul className="m-0 grid list-none grid-cols-1 gap-2 p-0">
          {rows.map(({ contribution, role }) => (
            <li key={contribution.exercise.id} className="rounded-2xl border border-line bg-bg p-3">
              <div className="flex items-baseline justify-between gap-3">
                <Link to={`/exercises/${contribution.exercise.id}`} className="min-w-0 truncate font-bold">
                  {contribution.exercise.name}
                </Link>
                <span className="shrink-0 text-sm text-muted">
                  {contribution.setCount} {contribution.setCount === 1 ? 'set' : 'sets'}
                </span>
              </div>
              <p className="m-0 mt-0.5 text-xs text-muted">
                {role === 'primary' ? 'Primary mover: counts 1 per set' : 'Secondary mover: counts ½ per set'}
              </p>
              {contribution.sets && <SetLines sets={contribution.sets} unit={unit} workoutDates={workoutDates} />}
            </li>
          ))}
        </ul>
      )}
    </Sheet>
  )
}

function SetLines({ sets, unit, workoutDates }: { sets: NonNullable<MuscleContribution['sets']>; unit: WeightUnit; workoutDates?: Map<string, string> }) {
  const groups = workoutDates ? groupSetsByWorkout(sets, workoutDates) : []
  if (groups.length <= 1) return <p className="m-0 mt-2 text-sm">{formatSetList(sets, unit, 10)}</p>
  return (
    <ul className="m-0 mt-2 grid list-none grid-cols-1 gap-1 p-0 text-sm">
      {groups.map((group) => (
        <li key={group.sessionId} className="flex gap-3">
          <span className="w-24 shrink-0 text-muted">{group.startedAt ? formatDate(group.startedAt) : 'Earlier'}</span>
          <span className="min-w-0">{formatSetList(group.sets, unit, 6)}</span>
        </li>
      ))}
    </ul>
  )
}
