import type { CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { rankInfo } from '../config/ranks'
import { muscleLabel } from '../lib/format'
import { liftValueText, liftsThatRank, rankName } from '../lib/rankFormat'
import { SECONDARY_SHARE, type MuscleRank } from '../lib/strengthRank'
import type { Muscle, WeightUnit } from '../types/db'
import { RankBar } from './RankBar'
import { RankEmblem } from './RankEmblem'
import { Sheet } from './Sheet'

interface Props {
  open: boolean
  title: string
  /** Our muscles behind the tapped region or chip. */
  muscles: Muscle[]
  ranks: Partial<Record<Muscle, MuscleRank>>
  unit: WeightUnit
  onClose: () => void
}

const SHOWN = 5

/** A tapped muscle's rank and the lifts that give it, or lifts that would rank it. */
export function MuscleRankSheet({ open, title, muscles, ranks, unit, onClose }: Props) {
  return (
    <Sheet open={open} title={title} onClose={onClose}>
      <div className="grid grid-cols-1 gap-5">
        {muscles.map((muscle) => {
          const rank = ranks[muscle]
          return (
            <section key={muscle} aria-label={muscleLabel(muscle)}>
              <div className="flex items-center gap-3">
                <RankEmblem rank={rank?.rank ?? null} size={52} artKey={`muscle:${muscle}`} />
                <div className="min-w-0 flex-1">
                  {muscles.length > 1 && <p className="text-xs font-extrabold text-muted uppercase">{muscleLabel(muscle)}</p>}
                  <p className="font-display text-lg leading-tight font-extrabold">{rank ? rankName(rank.rank, true) : 'Not ranked yet'}</p>
                  {rank && (
                    <p className="text-sm text-muted">
                      {rank.sources[0].role === 'primary' ? 'Estimated from your best lift comparison at your bodyweight' : 'From lifts where it’s a helper muscle'}
                    </p>
                  )}
                </div>
              </div>
              {rank && <RankBar rank={rank.rank} progress={rank.progress} />}

              {rank ? (
                <ul className="m-0 mt-3 grid list-none grid-cols-1 gap-2 p-0">
                  {rank.sources.slice(0, SHOWN).map(({ badge, role }) => (
                    <li key={badge.exercise.id} className="rounded-2xl border border-line bg-bg p-3" style={{ '--rank': rankInfo(badge.rank).color } as CSSProperties}>
                      <div className="flex items-baseline justify-between gap-3">
                        <Link to={`/exercises/${badge.exercise.id}`} className="min-w-0 truncate font-bold">
                          {badge.exercise.name}
                        </Link>
                        <span className="flex shrink-0 items-center gap-1.5 text-sm font-bold">
                          <span className="rank-swatch" aria-hidden="true" /> {rankInfo(badge.rank).name}
                        </span>
                      </div>
                      <p className="mt-0.5 text-sm text-muted">
                        {liftValueText(badge.standard, badge.value, unit)} ·{' '}
                        {role === 'primary' ? 'main muscle' : `helper muscle, counts ${Math.round(SECONDARY_SHARE * 100)}%`}
                      </p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="m-0 mt-3 rounded-2xl border border-dashed border-line p-4 text-sm text-muted">
                  No lift you’ve logged ranks this yet. Try {liftsThatRank(muscle).join(', ')}.
                </p>
              )}
            </section>
          )
        })}
      </div>
    </Sheet>
  )
}
