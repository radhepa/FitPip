import type { CSSProperties } from 'react'
import { RANK_COUNT, rankInfo, type RankNumber } from '../config/ranks'

interface Props {
  rank: RankNumber
  /** 0..1 of the way to the next rank. */
  progress: number
  /** Replaces the default "62% of the way to Emerald" line. */
  caption?: string
  compact?: boolean
}

/** A thin bar in the rank's colour showing how close the next rank is. */
export function RankBar({ rank, progress, caption, compact = false }: Props) {
  const top = rank === RANK_COUNT
  const pct = Math.round(Math.max(0, Math.min(1, progress)) * 100)
  const next = top ? null : rankInfo((rank + 1) as RankNumber)
  const text = caption ?? (top ? 'Top rank reached' : `${pct}% of the way to ${next!.name}`)
  return (
    <div className={compact ? '' : 'mt-2'}>
      <div
        className="rank-bar"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={top ? 100 : pct}
        aria-label={text}
        style={{ '--rank': rankInfo(rank).color, '--fill': `${top ? 100 : pct}%` } as CSSProperties}
      >
        <span />
      </div>
      {!compact && <p className="mt-1 text-xs text-muted">{text}</p>}
    </div>
  )
}
