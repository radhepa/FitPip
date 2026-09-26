import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import type { NewWorkoutRequest } from '../hooks/useNewWorkout'
import { CATEGORY_INFO } from '../lib/activity'
import { combinedName, combinedPlan, completedEntryIds, entryName, entryPlan, type PlanEntry, type TodayPlan } from '../lib/weekPlan'
import type { BegunSession, Category, Exercise, SetRow } from '../types/db'
import { Button } from './Button'
import { PlayIcon } from './icons'
import { LineupCard } from './LineupCard'
import { Pip } from './Pip'
import { QuickStart } from './QuickStart'

interface Props {
  plan: TodayPlan
  exercises: Exercise[]
  todays: { session: BegunSession; sets: SetRow[] }[]
  busy: boolean
  error: string | null
  onCreate: (request: NewWorkoutRequest) => void
}

function requestFor(entry: PlanEntry): NewWorkoutRequest {
  if (entry.kind === 'routine') return { template: { id: entry.routine.template.id, name: entry.routine.template.name } }
  // A kind of workout starts empty with the exercise picker open on that kind.
  if (entry.kind === 'category') return { name: entryName(entry), pick: entry.category }
  return { name: entryName(entry), plan: entryPlan(entry) }
}

/** Today's plan as big start cards, or quick-start buttons when nothing is planned. */
export function TodayLineup({ plan, exercises, todays, busy, error, onCreate }: Props) {
  const exerciseById = useMemo(() => new Map(exercises.map((e) => [e.id, e])), [exercises])
  const entries = useMemo(() => (plan.kind === 'planned' ? plan.entries : []), [plan])
  const done = useMemo(() => completedEntryIds(entries, todays, exerciseById), [entries, todays, exerciseById])
  const left = entries.filter((e) => !done.has(e.item.id))
  const quick = (pick: Category | null) => onCreate(pick ? { name: CATEGORY_INFO[pick].label, pick } : {})

  return (
    <section className="section-block">
      <div className="section-heading">
        <h2>{plan.kind === 'planned' ? "Today's lineup" : plan.kind === 'rest' ? 'Rest day' : 'Start something'}</h2>
        {plan.kind === 'planned' && (
          <span className="text-sm font-bold text-muted">
            {done.size}/{entries.length} done
          </span>
        )}
        {plan.kind === 'unplanned' && (
          <Link to="/plan" className="text-link">
            Plan my week
          </Link>
        )}
      </div>

      {plan.kind === 'planned' && (
        <div className="stagger grid grid-cols-1 gap-2.5">
          {entries.map((entry, i) => (
            <LineupCard
              key={entry.item.id}
              index={i}
              entry={entry}
              exerciseById={exerciseById}
              done={done.has(entry.item.id)}
              busy={busy}
              onStart={() => onCreate(requestFor(entry))}
            />
          ))}
          {left.length > 1 && (
            <Button variant="primary" block disabled={busy} onClick={() => onCreate({ name: combinedName(left), plan: combinedPlan(left) })}>
              <PlayIcon /> Do all {left.length} as one workout
            </Button>
          )}
        </div>
      )}

      {plan.kind === 'rest' && (
        <div className="card card-pad mb-3 flex items-center gap-3">
          <Pip pose="sleep" size={84} />
          <div>
            <p className="font-extrabold">Recovery is training too.</p>
            <p className="mt-1 text-sm text-muted">Nothing planned today. Feeling good? Start anything below.</p>
          </div>
        </div>
      )}

      {plan.kind !== 'planned' && <QuickStart busy={busy} onStart={quick} />}
      {plan.kind === 'planned' && (
        <details className="mt-3">
          <summary className="cursor-pointer text-sm font-bold text-muted">Do something else instead</summary>
          <div className="mt-3">
            <QuickStart busy={busy} onStart={quick} />
          </div>
        </details>
      )}
      {error && <p className="mt-2 text-sm text-danger">{error}</p>}
    </section>
  )
}
