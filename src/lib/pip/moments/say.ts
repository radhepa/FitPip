import type { PipMood } from '../../../components/pip/types'
import { localDateIso } from '../../bodyWeight'
import { formatWeight } from '../../format'
import type { PipFacts } from '../facts'
import { fill, pickVariant } from '../text'
import type { PipChoice, PipMoment, PipTalk, PipTopic } from '../types'

/**
 * One filled-in wording. The same wording is used all day for a given moment and another one
 * tomorrow. Wordings that need {name} are skipped when no name is set.
 */
export function say(facts: PipFacts, id: string, variants: readonly string[], slots: Record<string, string | number> = {}): string {
  const usable = facts.name ? variants : variants.filter((v) => !v.includes('{name}'))
  const chosen = pickVariant(usable.length > 0 ? usable : variants, `${id}|${localDateIso(facts.now)}`)
  return fill(chosen, { ...slots, name: facts.name ?? 'friend' }).replace(/\s{2,}/g, ' ').trim()
}

interface MomentOptions {
  id: string
  text: string
  topic: PipTopic
  priority: number
  cooldownHours?: number
  mood?: PipMood | null
  talk?: PipTalk
  on?: string
  choices?: PipChoice[]
}

export const moment = ({ cooldownHours = 24, mood = null, ...rest }: MomentOptions): PipMoment => ({ cooldownHours, mood, ...rest })

/** A weight as people say it: "155", "212.5". */
export const num = (n: number): string => formatWeight(Math.round(n * 10) / 10)

/** Lowercase-first list of names for a line: "Push day", "Push day and Cardio", "A, B and 2 more". */
export function namesText(names: string[]): string {
  if (names.length <= 1) return names[0] ?? ''
  if (names.length === 2) return `${names[0]} and ${names[1]}`
  return `${names[0]}, ${names[1]} and ${names.length - 2} more`
}
