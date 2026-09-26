import type { CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { formatMinutes } from '../lib/format'
import type { WeekTotals } from '../lib/homeStats'
import type { WeightUnit } from '../types/db'
import { CountUp } from './CountUp'
import { ArrowDownIcon, ArrowUpIcon, FlameIcon } from './icons'
import { ProgressRing } from './ProgressRing'

interface Props {
  streak: number
  totals: WeekTotals
  weight: { latest: number; change: number | null; unit: WeightUnit } | null
}

/** Three headline numbers: the streak, this week against the plan, and body weight. */
export function StatTiles({ streak, totals, weight }: Props) {
  const goal = totals.plannedDays > 0 ? totals.plannedDays : Math.max(3, totals.workouts)
  const done = totals.plannedDays > 0 ? totals.plannedDaysDone : totals.workouts
  return (
    <div className="stagger grid grid-cols-3 gap-2.5">
      <div className="card flex flex-col justify-between gap-2 p-3" style={{ '--i': 0 } as CSSProperties}>
        <span className={streak > 0 ? 'icon-tile' : 'icon-tile !bg-surface-2 !text-muted'} style={{ '--tint': 'var(--cat-cardio)', '--tile': '2.25rem' } as CSSProperties}>
          <FlameIcon />
        </span>
        <div>
          <p className="font-display text-[1.75rem] leading-none font-extrabold">
            <CountUp value={streak} />
          </p>
          <p className="mt-1 text-xs font-semibold text-muted">day streak</p>
        </div>
      </div>

      <div className="card flex flex-col items-start justify-between gap-2 p-3" style={{ '--i': 1 } as CSSProperties}>
        <ProgressRing value={done / goal} size={44} stroke={5} label={`${done} of ${goal} this week`}>
          <span className="text-[.7rem] font-extrabold">{done}/{goal}</span>
        </ProgressRing>
        <div>
          <p className="font-display text-[1.1rem] leading-none font-extrabold">{formatMinutes(totals.activeSeconds)}</p>
          <p className="mt-1 text-xs font-semibold text-muted">this week</p>
        </div>
      </div>

      <Link to="/weigh-in" className="card pressable flex flex-col justify-between gap-2 p-3" style={{ '--i': 2 } as CSSProperties}>
        {weight ? (
          <>
            <span
              className={`inline-flex w-fit items-center gap-0.5 rounded-full px-2 py-1 text-xs font-extrabold ${
                weight.change === null || weight.change === 0 ? 'bg-surface-2 text-muted' : 'bg-accent/15 text-accent'
              }`}
            >
              {weight.change !== null && weight.change < 0 && <ArrowDownIcon size="size-3.5" />}
              {weight.change !== null && weight.change > 0 && <ArrowUpIcon size="size-3.5" />}
              {weight.change === null ? 'new' : Math.abs(weight.change)}
            </span>
            <div>
              <p className="font-display text-[1.5rem] leading-none font-extrabold">
                <CountUp value={weight.latest} format={(n) => n.toFixed(1)} />
              </p>
              <p className="mt-1 text-xs font-semibold text-muted">{weight.unit} · 7 days</p>
            </div>
          </>
        ) : (
          <>
            <span className="grid size-9 place-items-center rounded-xl bg-accent/15 text-lg text-accent">+</span>
            <div>
              <p className="text-sm leading-tight font-extrabold">Weigh in</p>
              <p className="mt-1 text-xs font-semibold text-muted">Step on the scale</p>
            </div>
          </>
        )}
      </Link>
    </div>
  )
}
