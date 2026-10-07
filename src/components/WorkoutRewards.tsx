import type { CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { rankInfo } from '../config/ranks'
import { XP_RULES } from '../config/xp'
import { useSettings } from '../hooks/useSettings'
import { countOf, formatSeconds, formatWeight, formatWhole } from '../lib/format'
import type { WorkoutRewards as Rewards } from '../lib/profile'
import { formatDistance, lengthUnitFor } from '../lib/units'
import type { RecordEvent } from '../lib/xp'
import type { Exercise } from '../types/db'
import { RankEmblem } from './RankEmblem'

const SHOWN = 8

interface Props {
  rewards: Rewards | null
  exerciseById: Map<string, Exercise>
  /** Sex or bodyweight isn't set yet: offer to set up the profile. */
  missingProfile: boolean
}

/** What a workout earned: XP, a level-up, personal records and every badge it ranked up. */
export function WorkoutRewards({ rewards, exerciseById, missingProfile }: Props) {
  const { unit, distanceUnit } = useSettings()
  if (!rewards?.xp || rewards.xp.total === 0) return null

  const { xp, rankUps } = rewards
  const recordText = (r: RecordEvent, exercise: Exercise | undefined) => {
    if (r.kind === 'e1rm') return `${formatWeight(r.value)} ${unit} est. 1RM (was ${formatWeight(r.previous)})`
    if (r.kind === 'reps') return `${countOf(r.value, 'rep')} (was ${r.previous})`
    if (r.kind === 'seconds') return `${formatSeconds(r.value)} (was ${formatSeconds(r.previous)})`
    const lengthUnit = lengthUnitFor(exercise?.category ?? 'cardio', distanceUnit)
    return `${formatDistance(r.value, lengthUnit)} (was ${formatDistance(r.previous, lengthUnit)})`
  }
  const parts = [
    `${xp.fromSets} from sets`,
    xp.finished > 0 && `${xp.finished} for finishing`,
    xp.records.length > 0 && `${xp.records.length * XP_RULES.personalRecord} for records`,
    xp.firstTimes.length > 0 && `${xp.firstTimes.length * XP_RULES.firstTime} for new exercises`,
  ].filter(Boolean)

  return (
    <section className="card mb-6 p-4" aria-labelledby="rewards-title">
      <span className="section-label">Rewards</span>
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h2 id="rewards-title" className="gradient-text m-0 font-display text-[2rem] leading-tight font-extrabold">
          +{formatWhole(xp.total)} XP
        </h2>
        {rewards.levelAfter > rewards.levelBefore && <span className="pill">Level {rewards.levelAfter}!</span>}
      </div>
      <p className="m-0 text-xs text-muted">{parts.join(' · ')}</p>

      {xp.records.length > 0 && (
        <ul className="m-0 mt-3 grid list-none grid-cols-1 gap-1.5 p-0" aria-label="Personal records">
          {xp.records.map((r) => (
            <li key={r.exerciseId} className="text-sm">
              <span className="font-extrabold">New record · {exerciseById.get(r.exerciseId)?.name ?? 'Exercise'}</span>
              <span className="text-muted"> · {recordText(r, exerciseById.get(r.exerciseId))}</span>
            </li>
          ))}
        </ul>
      )}

      {rankUps.length > 0 && (
        <ul className="m-0 mt-3 grid list-none grid-cols-1 gap-2 p-0" aria-label="Ranks earned">
          {rankUps.slice(0, SHOWN).map((up, i) => (
            <li key={`${up.kind}-${up.label}`} className="flex items-center gap-3" style={{ '--i': i } as CSSProperties}>
              <RankEmblem rank={up.to} size={40} className="badge-pop" />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-extrabold">{up.label}</span>
                <span className="block text-xs text-muted">
                  {up.from ? `${rankInfo(up.from).name} → ${rankInfo(up.to).name}` : `New badge · ${rankInfo(up.to).name}`}
                </span>
              </span>
            </li>
          ))}
          {rankUps.length > SHOWN && <li className="text-xs text-muted">and {rankUps.length - SHOWN} more on your profile</li>}
        </ul>
      )}

      {missingProfile && (
        <p className="mt-3 text-xs text-muted">
          <Link to="/profile" className="text-link">
            Set up your profile
          </Link>{' '}
          to rank your lifts against other people.
        </p>
      )}
    </section>
  )
}
