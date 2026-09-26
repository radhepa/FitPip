import { rankForPercentile } from '../lib/percentile'
import { rankName } from '../lib/rankFormat'
import type { OverallRank } from '../lib/strengthRank'
import { RankBar } from './RankBar'
import { RankEmblem } from './RankEmblem'

/** The six body parts behind the overall rank, each with its own rank and bar. */
export function GroupRanks({ overall }: { overall: OverallRank }) {
  const missing = overall.groups.filter((g) => g.percentile === null).map((g) => g.label.toLowerCase())
  return (
    <section className="card p-4" aria-labelledby="groups-title">
      <span className="section-label">Overall rank</span>
      <h2 id="groups-title" className="m-0 font-display text-xl font-extrabold">
        By body part
      </h2>
      <p className="m-0 mt-1 text-sm text-muted">
        Your overall rank is the average of these six{missing.length > 0 ? `. Unranked parts count as zero, so ranking your ${joinWords(missing)} lifts it fastest.` : '.'}
      </p>
      <ul className="m-0 mt-3 grid list-none grid-cols-1 gap-3 p-0">
        {overall.groups.map((g) => {
          const position = g.percentile === null ? null : rankForPercentile(g.percentile)
          return (
            <li key={g.key} className="flex items-center gap-3">
              <RankEmblem rank={g.rank} size={36} />
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="font-bold">{g.label}</span>
                  <span className="text-sm font-bold text-muted">{g.rank ? rankName(g.rank) : 'Not ranked'}</span>
                </div>
                {position ? <RankBar rank={position.rank} progress={position.progress} compact /> : <div className="rank-bar" aria-hidden="true" />}
              </div>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

function joinWords(words: string[]): string {
  if (words.length <= 1) return words.join('')
  return `${words.slice(0, -1).join(', ')} and ${words.at(-1)}`
}
