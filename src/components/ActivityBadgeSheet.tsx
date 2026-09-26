import { useMemo, type CSSProperties } from 'react'
import { RANKS, rankInfo } from '../config/ranks'
import { useSettings } from '../hooks/useSettings'
import { paceLadder, type ActivityBadge } from '../lib/activityRank'
import { formatClock, formatDate } from '../lib/format'
import { beatsText, hoursText, paceValueText, rankName } from '../lib/rankFormat'
import { formatDistance, lengthUnitFor } from '../lib/units'
import type { DistanceUnit } from '../types/db'
import { RankBar } from './RankBar'
import { RankEmblem } from './RankEmblem'
import { Sheet } from './Sheet'

interface Props {
  badge: ActivityBadge | null
  distanceUnit: DistanceUnit
  onClose: () => void
}

/** One cardio or practice badge: what it's ranked on, your best or your hours, and each rank's target. */
export function ActivityBadgeSheet({ badge, distanceUnit, onClose }: Props) {
  const { compareSex } = useSettings()
  const pace = badge?.def.pace
  const ladder = useMemo(() => {
    if (!badge) return []
    if (badge.basis === 'pace' && pace && compareSex) return paceLadder(pace, compareSex).map((s) => ({ rank: s.rank, text: s.value === null ? 'Start' : paceValueText(badge.def, s.value, distanceUnit) }))
    return RANKS.map((r) => ({ rank: r.rank, text: r.fromHours === 0 ? 'Start' : `${r.fromHours} h` }))
  }, [badge, pace, compareSex, distanceUnit])
  if (!badge) return null

  const next = badge.rank < 10 ? rankInfo((badge.rank + 1) as typeof badge.rank) : null
  const hoursCaption = next ? `${hoursText(Math.max(60, next.fromHours * 3600 - badge.seconds))} more to reach ${next.name}` : undefined
  const lengthUnit = lengthUnitFor(badge.def.category, distanceUnit)
  const best = badge.best

  return (
    <Sheet open title={badge.def.label} onClose={onClose}>
      <div className="flex items-center gap-3">
        <RankEmblem rank={badge.rank} size={76} artKey={`activity:${badge.def.key}`} className="badge-pop" />
        <div className="min-w-0">
          <p className="font-display text-xl leading-tight font-extrabold">{rankName(badge.rank, true)}</p>
          <p className="text-sm text-muted">
            {best && pace ? beatsText(best.percentile, 'Faster', pace.people) : `Ranked on hours put in`}
          </p>
        </div>
      </div>
      <RankBar rank={badge.rank} progress={badge.progress} caption={badge.basis === 'hours' ? hoursCaption : undefined} />

      <dl className="m-0 mt-4 grid grid-cols-2 gap-2">
        {best && pace && (
          <div className="col-span-2 rounded-2xl bg-surface-2 p-3">
            <dt className="text-xs font-bold text-muted">Your best · {pace.measure}</dt>
            <dd className="m-0 mt-1 font-display text-lg font-extrabold">{paceValueText(badge.def, best.value, distanceUnit)}</dd>
            <dd className="m-0 text-xs text-muted">
              From {formatDistance(Number(best.set.distance_m), lengthUnit)} in {formatClock((best.set.duration_seconds ?? 0) * 1000)} on {formatDate(best.at)}
            </dd>
          </div>
        )}
        <div className="rounded-2xl bg-surface-2 p-3">
          <dt className="text-xs font-bold text-muted">Time put in</dt>
          <dd className="m-0 mt-1 font-display text-lg font-extrabold">{hoursText(badge.seconds)}</dd>
        </div>
        <div className="rounded-2xl bg-surface-2 p-3">
          <dt className="text-xs font-bold text-muted">Workouts</dt>
          <dd className="m-0 mt-1 font-display text-lg font-extrabold">{badge.sessions}</dd>
        </div>
      </dl>

      <h3 className="mt-5 mb-2 font-display text-base font-extrabold">What each rank takes{badge.basis === 'pace' && pace ? ` · ${pace.measure}` : ''}</h3>
      <ol className="m-0 grid list-none grid-cols-1 gap-1 p-0">
        {ladder.map((step) => {
          const mine = step.rank === badge.rank
          return (
            <li
              key={step.rank}
              className={`flex items-center justify-between gap-3 rounded-xl px-3 py-1.5 text-sm ${mine ? 'bg-surface-2 font-extrabold' : ''}`}
              style={{ '--rank': rankInfo(step.rank).color } as CSSProperties}
              aria-current={mine ? 'true' : undefined}
            >
              <span className="flex items-center gap-2">
                <RankEmblem rank={step.rank} size={32} />
                {step.rank} {rankInfo(step.rank).name}
                {mine && <span className="pill">You</span>}
              </span>
              <span className="tabular-nums">{step.text}</span>
            </li>
          )
        })}
      </ol>

      <p className="mt-4 text-xs text-muted">
        Counts: {badge.exercises.map((e) => e.name).join(', ')}.{' '}
        {pace && badge.basis === 'hours' &&
          (compareSex
            ? `Log a distance and time (at least ${formatDistance(pace.minDistanceM, lengthUnit)}) to be ranked on pace instead.`
            : 'Choose men’s or women’s standards on your profile to be ranked on pace.')}
        {badge.basis === 'pace' && ' Efforts of any length are converted to the same distance, so short and long ones both count.'}
      </p>
    </Sheet>
  )
}
