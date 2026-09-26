import { useMemo, useState, type CSSProperties } from 'react'
import { BODY_LABEL, BODY_TO_MUSCLES, type BodyMuscle } from '../config/muscleMap'
import { RANKS, UNRANKED_COLOR, rankInfo } from '../config/ranks'
import { muscleLabel } from '../lib/format'
import { regionRanks } from '../lib/rankFormat'
import type { MuscleRank } from '../lib/strengthRank'
import type { Muscle, WeightUnit } from '../types/db'
import { MuscleHeatmap } from './MuscleHeatmap'
import { MuscleRankSheet } from './MuscleRankSheet'
import { RankLegend } from './RankLegend'

interface Props {
  muscles: Partial<Record<Muscle, MuscleRank>>
  unit: WeightUnit
  /** A line under the map: what the ranks are compared at, or what's still needed. */
  note: string
}

const RANK_COLORS = RANKS.map((r) => r.color)

/** The body map coloured by each muscle's rank, with a key and a chip per ranked muscle. */
export function StrengthMap({ muscles, unit, note }: Props) {
  const [selection, setSelection] = useState<{ title: string; muscles: Muscle[] } | null>(null)
  const levels = useMemo(() => regionRanks(muscles), [muscles])
  const ranked = useMemo(() => (Object.values(muscles) as MuscleRank[]).sort((a, b) => b.percentile - a.percentile), [muscles])

  const selectRegion = (region: BodyMuscle) => {
    const list = BODY_TO_MUSCLES[region]
    if (!list) return // head, neck and knees are drawn but not tracked
    setSelection({ title: list.length === 1 ? muscleLabel(list[0]) : (BODY_LABEL[region] ?? 'Muscles'), muscles: list })
  }

  return (
    <section className="card p-4" aria-labelledby="strength-map-title">
      <span className="section-label">Strength map</span>
      <h2 id="strength-map-title" className="m-0 font-display text-xl font-extrabold">
        Rank by muscle
      </h2>
      <p className="m-0 mt-1 mb-3 text-sm text-muted">Each muscle takes the rank of its best lift. Tap one to see the lifts behind it.</p>

      <div className="anatomy-plate rounded-2xl bg-plate p-3 text-plate-ink">
        <MuscleHeatmap levels={levels} colors={RANK_COLORS} bodyColor={UNRANKED_COLOR} label="muscles coloured by strength rank" onSelect={selectRegion} />
        <div className="mt-3">
          <RankLegend />
        </div>
      </div>

      {ranked.length > 0 && (
        <ul className="m-0 mt-4 flex list-none flex-wrap gap-2 p-0" aria-label="Ranked muscles, best first">
          {ranked.map((m) => (
            <li key={m.muscle}>
              <button
                type="button"
                className="filter-chip"
                style={{ '--rank': rankInfo(m.rank).color } as CSSProperties}
                onClick={() => setSelection({ title: muscleLabel(m.muscle), muscles: [m.muscle] })}
              >
                <span className="rank-swatch" aria-hidden="true" />
                {muscleLabel(m.muscle)} · {rankInfo(m.rank).name}
              </button>
            </li>
          ))}
        </ul>
      )}

      <p className="m-0 mt-3 text-xs text-muted">{note}</p>

      <MuscleRankSheet
        open={selection !== null}
        title={selection?.title ?? ''}
        muscles={selection?.muscles ?? []}
        ranks={muscles}
        unit={unit}
        onClose={() => setSelection(null)}
      />
    </section>
  )
}
