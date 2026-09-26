import { useState, type CSSProperties } from 'react'
import { rankInfo } from '../config/ranks'
import type { ActivityBadge } from '../lib/activityRank'
import { hoursText, topText } from '../lib/rankFormat'
import type { DistanceUnit } from '../types/db'
import { ActivityBadgeSheet } from './ActivityBadgeSheet'
import { RankEmblem } from './RankEmblem'

interface Props {
  badges: ActivityBadge[]
  distanceUnit: DistanceUnit
}

/** A badge per kind of cardio or practice: pace against other people, or hours put in. */
export function ActivityBadges({ badges, distanceUnit }: Props) {
  const [open, setOpen] = useState<ActivityBadge | null>(null)
  return (
    <section aria-labelledby="activity-badges-title">
      <div className="section-heading">
        <h2 id="activity-badges-title">Cardio & practice badges</h2>
        {badges.length > 0 && <span className="text-sm font-bold text-muted">{badges.length}</span>}
      </div>

      {badges.length === 0 ? (
        <p className="card card-pad text-sm text-muted">Runs, rides, swims, yoga, boxing and sports each earn a badge. Log one to start.</p>
      ) : (
        <ul className="m-0 grid list-none grid-cols-2 gap-2.5 p-0 min-[520px]:grid-cols-3 lg:grid-cols-4">
          {badges.map((badge, i) => (
            <li key={badge.def.key}>
              <button
                type="button"
                className="card pressable badge-tile"
                style={{ '--rank': rankInfo(badge.rank).color, '--i': Math.min(i, 12) } as CSSProperties}
                onClick={() => setOpen(badge)}
                aria-label={`${badge.def.label}: ${rankInfo(badge.rank).name}`}
              >
                <RankEmblem rank={badge.rank} size={56} artKey={`activity:${badge.def.key}`} className="badge-pop" />
                <span className="line-clamp-2 text-sm leading-tight font-extrabold">{badge.def.label}</span>
                <span className="text-xs font-bold text-muted">
                  {rankInfo(badge.rank).name}
                  {badge.percentile !== null && ` · ${topText(badge.percentile)}`}
                </span>
                <span className="text-xs text-muted">{badge.basis === 'pace' ? 'Ranked on pace' : `${hoursText(badge.seconds)} in`}</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      <ActivityBadgeSheet badge={open} distanceUnit={distanceUnit} onClose={() => setOpen(null)} />
    </section>
  )
}
