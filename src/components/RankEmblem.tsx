import { badgeArt } from '../config/badgeArt'
import { rankInfo, type RankNumber } from '../config/ranks'

interface Props {
  /** Null shows the "not earned yet" emblem. */
  rank: RankNumber | null
  /** Width and height in px. */
  size?: number
  /** Optional per-badge art key (see config/badgeArt.ts). */
  artKey?: string
  /** Set when the emblem stands alone; leave out when the rank is written next to it. */
  label?: string
  className?: string
}

/** A badge's emblem. The picture comes from config/badgeArt.ts, so the art can be swapped freely. */
export function RankEmblem({ rank, size = 48, artKey, label, className = '' }: Props) {
  return (
    <img
      src={badgeArt(rank, artKey)}
      width={size}
      height={size}
      alt={label ?? ''}
      aria-hidden={label ? undefined : true}
      title={label ?? (rank ? rankInfo(rank).name : undefined)}
      loading="lazy"
      decoding="async"
      draggable={false}
      className={`rank-emblem shrink-0 select-none ${className}`}
    />
  )
}
