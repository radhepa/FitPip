import type { CSSProperties } from 'react'
import type { Profile } from '../lib/profile'
import { rankName } from '../lib/rankFormat'
import { CountUp } from './CountUp'
import { PencilIcon } from './icons'
import { RankEmblem } from './RankEmblem'

interface Props {
  name: string | null
  profile: Profile
  onEdit: () => void
}

/** The top of the profile: overall rank emblem, name, and XP level with its bar. */
export function ProfileHero({ name, profile, onEdit }: Props) {
  const { overall, xp } = profile
  return (
    <section className="card card-hero p-4" aria-label="Your rank and level">
      <div className="flex items-start gap-3.5">
        <RankEmblem rank={overall?.rank ?? null} size={84} artKey="overall" label={overall ? `Overall rank: ${rankName(overall.rank)}` : 'Not ranked yet'} className="badge-pop" />
        <div className="min-w-0 flex-1">
          <p className="text-xs font-extrabold tracking-wide text-muted uppercase">Overall rank</p>
          <p className="font-display text-[1.6rem] leading-tight font-extrabold">{overall ? rankName(overall.rank) : 'Unranked'}</p>
          <p className="truncate text-sm font-bold text-muted">{name ?? 'Add your name'}</p>
        </div>
        <button type="button" className="icon-button shrink-0" aria-label="Edit profile" onClick={onEdit}>
          <PencilIcon />
        </button>
      </div>

      <div className="mt-4">
        <div className="flex items-end justify-between gap-3">
          <p className="font-display text-xl leading-none font-extrabold">
            Level <CountUp value={xp.level} />
          </p>
          <p className="text-xs font-bold text-muted tabular-nums">
            {Math.round(xp.into).toLocaleString()} / {xp.span.toLocaleString()} XP
          </p>
        </div>
        <div className="xp-bar mt-2" role="progressbar" aria-valuemin={0} aria-valuemax={xp.span} aria-valuenow={Math.round(xp.into)} aria-label={`XP to level ${xp.level + 1}`}>
          <span style={{ '--fill': `${Math.round(xp.progress * 100)}%` } as CSSProperties} />
        </div>
        <p className="mt-2 text-xs font-semibold text-muted">
          {xp.total.toLocaleString()} XP earned · +{xp.thisWeek.toLocaleString()} in the last 7 days
        </p>
      </div>
    </section>
  )
}
