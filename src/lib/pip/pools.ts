// Pip's banks of everyday lines (the mood banks and the topic banks) and how often each comes up
// on a given day: a lifting day leans on lifting and form tips, a rest day on recovery, a cut on
// cutting advice.
import type { PipMood } from '../../components/pip/types'
import { MOOD_LINES } from '../../config/pip/moodLines'
import { THEMES, type ThemeKey } from '../../config/pip/themeLines'
import type { PipFacts } from './facts'

export interface Pool {
  key: string
  /** The gesture Pip makes while saying a line from this bank; null keeps the page's pose. */
  mood: PipMood | null
  lines: readonly string[]
}

const moodPools: Pool[] = (Object.keys(MOOD_LINES) as PipMood[]).map((mood) => ({ key: `mood:${mood}`, mood: mood === 'idle' ? null : mood, lines: MOOD_LINES[mood] }))
const themePools: Pool[] = (Object.keys(THEMES) as ThemeKey[]).map((theme) => ({ key: `theme:${theme}`, mood: THEMES[theme].gesture, lines: THEMES[theme].lines }))

export const POOLS: readonly Pool[] = [...moodPools, ...themePools]
export const POOL_BY_KEY: ReadonlyMap<string, Pool> = new Map(POOLS.map((p) => [p.key, p]))

/**
 * How much each bank counts today (1 is normal, 0 is never). `base` is the page's pose: 'sleep' on
 * a rest day. Without facts every bank counts the same.
 */
export function poolWeights(facts: PipFacts | null, base: PipMood): Record<string, number> {
  const w: Record<string, number> = Object.fromEntries(POOLS.map((p) => [p.key, 1]))
  w['mood:sleep'] = base === 'sleep' ? 3 : 0
  w['mood:celebrate'] = 0.5
  w['theme:start'] = 0.5
  w['theme:gymFloor'] = 0.5
  if (!facts) return w

  const plan = facts.plan
  const categories = new Set(plan?.kind === 'planned' ? plan.categories : [])
  const planned = plan?.kind === 'planned'
  const lifting = categories.has('strength') || !planned
  const cardio = categories.has('cardio') || categories.has('sport')
  w['theme:lifting'] = lifting ? 3 : 1
  w['theme:form'] = lifting ? 2 : 0.5
  w['theme:singleArm'] = lifting ? (facts.habit.singleArmSets > 0 ? 3 : 2) : 0.5
  w['theme:cardio'] = cardio ? 3 : 1
  w['theme:cardioMachines'] = cardio ? 3 : 1
  w['theme:swim'] = categories.has('swim') ? 3 : 0.3
  w['theme:boxing'] = categories.has('combat') ? 3 : 0.3
  w['theme:mobility'] = categories.has('yoga') || categories.has('stretch') ? 3 : 0.7
  w['theme:recovery'] = plan?.kind === 'rest' || base === 'sleep' ? 3 : 1
  w['mood:yawn'] = plan?.kind === 'rest' ? 2 : 1

  const weight = facts.weight
  w['theme:scale'] = !weight || weight.daysSince >= 2 ? 2 : 1
  const cutting = weight?.direction === 'lose'
  w['theme:cut'] = cutting ? 3 : 0
  w['theme:food'] = cutting ? 2 : 1
  return w
}

/** The deck of bank names for the day: each bank appears in proportion to its weight. */
export function poolKeys(weights: Record<string, number>): string[] {
  return POOLS.flatMap((p) => {
    const copies = Math.round((weights[p.key] ?? 1) * 2)
    return Array.from({ length: copies }, () => p.key)
  })
}
