// The 10-rank ladder used by every badge (lifts, muscles, cardio) and by the strength map.
// Names, colours and where each rank starts all live here, so they can be retuned in one place.
// The colours were checked for colour-blind separation and contrast on the anatomy plate and on
// dark cards; change them together and re-check.

export const RANK_COUNT = 10

export type RankNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10

export interface RankInfo {
  rank: RankNumber
  name: string
  color: string
  /** Percentile (0-100) at which a strength or pace badge reaches this rank. */
  fromPercentile: number
  /** Hours of practice at which a practice badge (yoga, walking, boxing...) reaches this rank. */
  fromHours: number
}

export const RANKS: readonly RankInfo[] = [
  { rank: 1, name: 'Wood', color: '#A24E3C', fromPercentile: 0, fromHours: 0 },
  { rank: 2, name: 'Bronze', color: '#C68520', fromPercentile: 10, fromHours: 1 },
  { rank: 3, name: 'Silver', color: '#6385D2', fromPercentile: 20, fromHours: 3 },
  { rank: 4, name: 'Gold', color: '#B88A08', fromPercentile: 32, fromHours: 6 },
  { rank: 5, name: 'Platinum', color: '#0A93A0', fromPercentile: 45, fromHours: 10 },
  { rank: 6, name: 'Emerald', color: '#5AA532', fromPercentile: 58, fromHours: 16 },
  { rank: 7, name: 'Diamond', color: '#2F95E8', fromPercentile: 70, fromHours: 25 },
  { rank: 8, name: 'Master', color: '#8452E0', fromPercentile: 80, fromHours: 40 },
  { rank: 9, name: 'Elite', color: '#C2307E', fromPercentile: 90, fromHours: 60 },
  { rank: 10, name: 'Legend', color: '#E4561A', fromPercentile: 97, fromHours: 100 },
]

/** Colour of a region nobody has a rank for yet (same as the weekly-sets map). */
export const UNRANKED_COLOR = '#B8C3D1'

export const rankInfo = (rank: RankNumber): RankInfo => RANKS[rank - 1]
