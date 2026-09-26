import { useMemo, type CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { rankInfo } from '../config/ranks'
import { formatDate, formatSet } from '../lib/format'
import { beatsText, liftMeasure, liftValueText, rankName } from '../lib/rankFormat'
import { averageValue, fromKg, rankLadder, type LiftBadge } from '../lib/strengthRank'
import type { WeightUnit } from '../types/db'
import { RankBar } from './RankBar'
import { RankEmblem } from './RankEmblem'
import { Sheet } from './Sheet'

interface Props {
  lift: LiftBadge | null
  unit: WeightUnit
  onClose: () => void
}

/** One lift's badge: your best, the average lifter your size, and what each rank takes. */
export function LiftBadgeSheet({ lift, unit, onClose }: Props) {
  const ladder = useMemo(() => (lift ? rankLadder(lift.comparison, unit) : []), [lift, unit])
  if (!lift) return null
  const { standard, comparison } = lift
  const average = averageValue(comparison, unit)
  const next = ladder.find((step) => step.rank === lift.rank + 1)
  const who = comparison.sex === 'male' ? 'men' : 'women'
  const bodyweight = Math.round(fromKg(comparison.bodyweightKg, unit))
  const text = (value: number) => liftValueText(standard, value, unit)

  return (
    <Sheet open title={lift.exercise.name} onClose={onClose}>
      <div className="flex items-center gap-3">
        <RankEmblem rank={lift.rank} size={76} artKey={`lift:${standard.key}`} className="badge-pop" />
        <div className="min-w-0">
          <p className="font-display text-xl leading-tight font-extrabold">{rankName(lift.rank, true)}</p>
          <p className="text-sm text-muted">
            {beatsText(lift.percentile)} ({who}, {bodyweight} {unit})
          </p>
        </div>
      </div>
      <RankBar rank={lift.rank} progress={lift.progress} caption={next ? nextCaption(next.value - lift.value, rankInfo(next.rank).name, text) : undefined} />

      <dl className="m-0 mt-4 grid grid-cols-2 gap-2">
        <div className="rounded-2xl bg-surface-2 p-3">
          <dt className="text-xs font-bold text-muted">Your best · {liftMeasure(standard)}</dt>
          <dd className="m-0 mt-1 font-display text-lg font-extrabold">{text(lift.value)}</dd>
          <dd className="m-0 text-xs text-muted">
            {formatSet(lift.best, unit)} on {formatDate(lift.bestAt)}
          </dd>
        </div>
        <div className="rounded-2xl bg-surface-2 p-3">
          <dt className="text-xs font-bold text-muted">Average lifter your size</dt>
          <dd className="m-0 mt-1 font-display text-lg font-extrabold">{text(average)}</dd>
          <dd className="m-0 text-xs text-muted">
            {lift.value >= average ? 'You’re above average' : `${text(Math.max(0, average - lift.value))} to go`}
          </dd>
        </div>
      </dl>

      <h3 className="mt-5 mb-2 font-display text-base font-extrabold">What each rank takes</h3>
      <ol className="m-0 grid list-none grid-cols-1 gap-1 p-0">
        {ladder.map((step) => {
          const mine = step.rank === lift.rank
          return (
            <li
              key={step.rank}
              className={`flex items-center justify-between gap-3 rounded-xl px-3 py-1.5 text-sm ${mine ? 'bg-surface-2 font-extrabold' : ''}`}
              style={{ '--rank': rankInfo(step.rank).color } as CSSProperties}
              aria-current={mine ? 'true' : undefined}
            >
              <span className="flex items-center gap-2">
                <span className="rank-swatch" aria-hidden="true" />
                {step.rank} {rankInfo(step.rank).name}
                {mine && <span className="pill">You</span>}
              </span>
              <span className="tabular-nums">{step.rank === 1 ? 'Start' : text(step.value)}</span>
            </li>
          )
        })}
      </ol>

      <p className="mt-4 text-xs text-muted">
        Compared with {standard.label.toLowerCase()} standards for {who} who lift, at your bodyweight. These are estimates from published
        standards, not a lab test.{standard.kind === 'reps' ? ' Added weight counts towards your reps.' : ' One-rep maxes are estimated from your sets (up to 15 reps count).'}
      </p>
      <Link to={`/exercises/${lift.exercise.id}`} className="app-button button-secondary mt-3 w-full">
        Open {lift.exercise.name}
      </Link>
    </Sheet>
  )
}

function nextCaption(gap: number, name: string, text: (value: number) => string): string {
  return gap > 0 ? `${text(gap)} more to reach ${name}` : `Almost at ${name}`
}
