import type { CSSProperties } from 'react'
import { CATEGORY_INFO } from '../lib/activity'
import { entryCategories, entryMinutes, entryName, type PlanEntry } from '../lib/weekPlan'
import type { Exercise } from '../types/db'
import { CategoryTile, tint } from './CategoryTile'
import { CheckIcon, PlayIcon } from './icons'

interface Props {
  entry: PlanEntry
  exerciseById: Map<string, Exercise>
  done: boolean
  busy: boolean
  onStart: () => void
  index: number
}

/** One thing planned for today, with a big start button (or a check once it is done). */
export function LineupCard({ entry, exerciseById, done, busy, onStart, index }: Props) {
  const categories = entryCategories(entry, exerciseById)
  const main = categories[0]
  const minutes = entryMinutes(entry, exerciseById)
  const detail =
    entry.kind === 'category'
      ? 'Pick exercises when you start'
      : entry.kind === 'routine'
        ? entry.routine.items.length === 0 ? 'Lift · add exercises when you start' : `${entry.routine.items.length} ${entry.routine.items.length === 1 ? 'exercise' : 'exercises'} · ~${minutes} min`
        : `${CATEGORY_INFO[entry.exercise.category].label} · ~${minutes} min`

  return (
    <div className={`card card-tint flex items-center gap-3 p-3 ${done ? 'opacity-75' : ''}`} style={{ ...tint(main), '--i': index } as CSSProperties}>
      <CategoryTile category={main} size={3.25} />
      <div className="min-w-0 flex-1">
        <p className={`truncate text-[1.05rem] font-extrabold ${done ? 'line-through decoration-2' : ''}`}>{entryName(entry)}</p>
        <p className="truncate text-sm text-muted">{detail}</p>
        {categories.length > 1 && (
          <div className="mt-1.5 flex flex-wrap gap-1">
            {categories.map((c) => (
              <span key={c} className="pill" style={tint(c)}>
                {CATEGORY_INFO[c].short}
              </span>
            ))}
          </div>
        )}
      </div>
      {done ? (
        <span className="check-pop grid size-12 place-items-center rounded-full text-on-accent" style={{ background: 'var(--color-target)' }} aria-label="Done">
          <CheckIcon />
        </span>
      ) : (
        <button
          type="button"
          onClick={onStart}
          disabled={busy}
          aria-label={`Start ${entryName(entry)}`}
          className="grid size-12 shrink-0 cursor-pointer place-items-center rounded-full border-0 text-white transition-transform active:scale-90 disabled:opacity-50"
          style={{ background: CATEGORY_INFO[main].color, boxShadow: `0 8px 20px -8px ${CATEGORY_INFO[main].color}` }}
        >
          <PlayIcon />
        </button>
      )}
    </div>
  )
}
