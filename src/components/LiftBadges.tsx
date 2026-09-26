import { useState, type CSSProperties } from 'react'
import { rankInfo } from '../config/ranks'
import { liftValueText, topText } from '../lib/rankFormat'
import type { LiftBadge } from '../lib/strengthRank'
import type { Exercise, WeightUnit } from '../types/db'
import { LiftBadgeSheet } from './LiftBadgeSheet'
import { RankEmblem } from './RankEmblem'

interface Props {
  lifts: LiftBadge[]
  unranked: Exercise[]
  unit: WeightUnit
  /** Why lifts can't be ranked yet, when that's the case. */
  blockedReason: string | null
}

/** A badge per ranked lift, best first; tapping one shows how it compares and what's next. */
export function LiftBadges({ lifts, unranked, unit, blockedReason }: Props) {
  const [open, setOpen] = useState<LiftBadge | null>(null)
  return (
    <section aria-labelledby="lift-badges-title">
      <div className="section-heading">
        <h2 id="lift-badges-title">Lift badges</h2>
        {lifts.length > 0 && <span className="text-sm font-bold text-muted">{lifts.length}</span>}
      </div>

      {blockedReason ? (
        <p className="card card-pad text-sm text-muted">{blockedReason}</p>
      ) : lifts.length === 0 ? (
        <p className="card card-pad text-sm text-muted">Log a lift (bench, squat, pull-ups, curls…) to earn your first badge.</p>
      ) : (
        <ul className="m-0 grid list-none grid-cols-2 gap-2.5 p-0 min-[520px]:grid-cols-3 lg:grid-cols-4">
          {lifts.map((lift, i) => (
            <li key={lift.exercise.id}>
              <button
                type="button"
                className="card pressable badge-tile"
                style={{ '--rank': rankInfo(lift.rank).color, '--i': Math.min(i, 12) } as CSSProperties}
                onClick={() => setOpen(lift)}
                aria-label={`${lift.exercise.name}: ${rankInfo(lift.rank).name}, ${topText(lift.percentile)}`}
              >
                <RankEmblem rank={lift.rank} size={56} artKey={`lift:${lift.standard.key}`} className="badge-pop" />
                <span className="line-clamp-2 text-sm leading-tight font-extrabold">{lift.exercise.name}</span>
                <span className="text-xs font-bold text-muted">
                  {rankInfo(lift.rank).name} · {topText(lift.percentile)}
                </span>
                <span className="text-xs text-muted">{liftValueText(lift.standard, lift.value, unit)}</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {unranked.length > 0 && !blockedReason && (
        <p className="mt-3 text-xs text-muted">
          No standard to compare with yet, so not ranked: {unranked.map((e) => e.name).join(', ')}. They still earn XP and records.
        </p>
      )}

      <LiftBadgeSheet lift={open} unit={unit} onClose={() => setOpen(null)} />
    </section>
  )
}
