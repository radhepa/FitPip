import { RANKS, UNRANKED_COLOR } from '../config/ranks'

/** Key for the strength map: every rank's colour, number and name, plus "not ranked". */
export function RankLegend() {
  return (
    <ol className="m-0 grid list-none grid-cols-2 gap-x-3 gap-y-1.5 p-0 text-xs text-plate-ink min-[420px]:grid-cols-3" aria-label="Rank colours">
      {RANKS.map((r) => (
        <li key={r.rank} className="flex items-center gap-1.5">
          <span className="size-3.5 shrink-0 rounded-md border border-[var(--color-plate-ink)]" style={{ background: r.color }} aria-hidden="true" />
          <span>
            <span className="font-bold tabular-nums">{r.rank}</span> {r.name}
          </span>
        </li>
      ))}
      <li className="flex items-center gap-1.5">
        <span className="size-3.5 shrink-0 rounded-md border border-[var(--color-plate-ink)]" style={{ background: UNRANKED_COLOR }} aria-hidden="true" />
        <span>Not ranked yet</span>
      </li>
    </ol>
  )
}
