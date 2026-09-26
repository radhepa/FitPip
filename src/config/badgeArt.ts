// Shared Pip rank crests, generated into public/badges. See docs/badge-art.md
// for the design system, regeneration, and optional per-badge art overrides.
import type { RankNumber } from './ranks'

/** One emblem per rank, used on every badge of that rank. */
export const RANK_EMBLEMS: Record<RankNumber, string> = {
  1: '/badges/rank-01.svg',
  2: '/badges/rank-02.svg',
  3: '/badges/rank-03.svg',
  4: '/badges/rank-04.svg',
  5: '/badges/rank-05.svg',
  6: '/badges/rank-06.svg',
  7: '/badges/rank-07.svg',
  8: '/badges/rank-08.svg',
  9: '/badges/rank-09.svg',
  10: '/badges/rank-10.svg',
}

/** Shown for a badge that hasn't been earned yet. */
export const LOCKED_EMBLEM = '/badges/rank-locked.svg'

/**
 * Optional art for one badge in particular, used instead of the rank emblem. Keys:
 * `lift:<standard key>` (from config/strengthStandards.ts, e.g. `lift:bench`),
 * `activity:<badge key>` (from config/activityBadges.ts, e.g. `activity:running`),
 * `muscle:<muscle>` (e.g. `muscle:chest`) and `overall`.
 * Example: `'activity:running': '/badges/running.png'`
 */
export const BADGE_ART: Partial<Record<string, string>> = {}

export const badgeArt = (rank: RankNumber | null, key?: string): string =>
  (key && BADGE_ART[key]) || (rank ? RANK_EMBLEMS[rank] : LOCKED_EMBLEM)
