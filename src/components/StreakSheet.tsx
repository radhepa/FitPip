import { countOf } from '../lib/format'
import { Sheet } from './Sheet'

export interface StreakInfo {
  /** Weeks in a row with at least `minimum` workouts. */
  weeks: number
  /** Finished workouts so far this week. */
  thisWeek: number
  /** Workouts a week needs to count. */
  minimum: number
}

/** What the week streak means, and what this week still needs to keep it going. */
export function StreakSheet({ open, streak, onClose }: { open: boolean; streak: StreakInfo; onClose: () => void }) {
  const { weeks, thisWeek, minimum } = streak
  const left = Math.max(0, minimum - thisWeek)
  const headline = weeks === 0 ? 'No streak yet' : `${countOf(weeks, 'week')} in a row`
  const status =
    left === 0
      ? `This week already counts: ${countOf(thisWeek, 'workout')} done.`
      : weeks > 0
        ? `${countOf(left, 'more workout')} by Sunday keeps it going.`
        : `${countOf(left, 'more workout')} this week starts one.`

  return (
    <Sheet open={open} title="Week streak" onClose={onClose}>
      <p className="font-display text-3xl font-extrabold">{headline}</p>
      <p className="mt-2 text-muted">
        A week counts when you finish at least {minimum} workouts in it, Monday to Sunday. Rest days never break it, so
        take them.
      </p>
      <div className="card card-pad mt-4">
        <p className="text-sm font-bold text-muted">This week</p>
        <div className="mt-2 flex gap-1.5" aria-hidden="true">
          {Array.from({ length: Math.max(minimum, thisWeek) }, (_, i) => (
            <span key={i} className={`h-2.5 flex-1 rounded-full ${i < thisWeek ? '' : 'bg-surface-2'}`} style={i < thisWeek ? { background: 'var(--grad-accent)' } : undefined} />
          ))}
        </div>
        <p className="mt-2 font-bold">{status}</p>
      </div>
    </Sheet>
  )
}
