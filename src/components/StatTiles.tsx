import { useState, type CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { countOf, formatMinutes } from '../lib/format'
import type { WeekTotals } from '../lib/homeStats'
import type { WeightUnit } from '../types/db'
import { CountUp } from './CountUp'
import { ArrowDownIcon, ArrowUpIcon, FlameIcon } from './icons'
import { ProgressRing } from './ProgressRing'
import { StreakSheet, type StreakInfo } from './StreakSheet'

interface Props {
  streak: StreakInfo
  totals: WeekTotals
  /** `count` = weigh-ins so far: with only one, the change is still "new". */
  weight: { latest: number; change: number | null; count: number; unit: WeightUnit } | null
}

/** Three headline numbers: the week streak, this week (against the plan, if there is one) and body weight. */
export function StatTiles({ streak, totals, weight }: Props) {
  const [explaining, setExplaining] = useState(false)
  const planned = totals.plannedDays > 0
  const done = planned ? totals.plannedDaysDone : totals.workouts
  // With no plan there is no goal to show against, so the ring fills towards this week counting for the streak.
  const ring = planned ? done / totals.plannedDays : Math.min(1, totals.workouts / streak.minimum)
  const ringLabel = planned ? `${done} of ${countOf(totals.plannedDays, 'planned day')} done this week` : `${countOf(totals.workouts, 'workout')} this week`
  const lit = streak.weeks > 0 || streak.thisWeek >= streak.minimum

  return (
    <div className="stagger grid grid-cols-3 gap-2.5">
      <button
        type="button"
        className="card pressable flex cursor-pointer flex-col justify-between gap-2 p-3 text-left"
        style={{ '--i': 0 } as CSSProperties}
        onClick={() => setExplaining(true)}
        aria-label={`${countOf(streak.weeks, 'week')} streak, ${streak.thisWeek} of ${streak.minimum} workouts this week. What counts?`}
      >
        <span className="flex items-start justify-between gap-1">
          <span className={lit ? 'icon-tile' : 'icon-tile !bg-surface-2 !text-muted'} style={{ '--tint': 'var(--cat-cardio)', '--tile': '2.25rem' } as CSSProperties}>
            <FlameIcon />
          </span>
          {/* This week's workouts towards keeping the streak. */}
          <span className="mt-1 flex gap-1" aria-hidden="true">
            {Array.from({ length: streak.minimum }, (_, i) => (
              <span key={i} className={`size-2 rounded-full ${i < streak.thisWeek ? '' : 'bg-surface-2'}`} style={i < streak.thisWeek ? { background: 'var(--cat-cardio)' } : undefined} />
            ))}
          </span>
        </span>
        <span className="block">
          <span className="block font-display text-[1.75rem] leading-none font-extrabold">
            <CountUp value={streak.weeks} />
          </span>
          <span className="mt-1 block text-xs font-semibold text-muted">week streak</span>
        </span>
      </button>

      <Link to="/plan" className="card pressable flex flex-col items-start justify-between gap-2 p-3" style={{ '--i': 1 } as CSSProperties} aria-label={`${ringLabel}, ${formatMinutes(totals.activeSeconds)} active. Open the plan.`}>
        <ProgressRing value={ring} size={44} stroke={5} label={ringLabel}>
          <span className="text-[.7rem] font-extrabold">{planned ? `${done}/${totals.plannedDays}` : totals.workouts}</span>
        </ProgressRing>
        <div>
          <p className="font-display text-[1.1rem] leading-none font-extrabold">{formatMinutes(totals.activeSeconds)}</p>
          <p className="mt-1 text-xs font-semibold text-muted">this week</p>
        </div>
      </Link>

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
              {weight.change === null ? (weight.count < 2 ? 'new' : '–') : Math.abs(weight.change)}
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
      <StreakSheet open={explaining} streak={streak} onClose={() => setExplaining(false)} />
    </div>
  )
}
