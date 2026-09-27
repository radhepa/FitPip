// Deciding what Pip says. At launch he opens with the most fitting thing he knows about you; a tap
// mixes your own moments with everyday lines from the bank that suits the day; the three chips ask
// for a status, a throwback or a pep talk. Nothing repeats too soon: personal moments have a
// cooldown, and every bank of lines is dealt like a shuffled deck.
import type { PipMood } from '../../components/pip/types'
import { localDateIso } from '../bodyWeight'
import { drawKey, drawLine } from '../pipDeck'
import type { PipFacts } from './facts'
import { isFresh, remember, type PipMemory } from './memory'
import { progressMoment } from './moments'
import { POOL_BY_KEY, poolKeys, poolWeights } from './pools'
import type { PipChoice, PipMoment, PipTalk } from './types'

/** Something Pip says, with the gesture he makes while saying it. */
export interface Said {
  /** The personal moment's id, or the bank an everyday line came from. */
  id: string
  text: string
  mood: PipMood | null
  personal: boolean
  /** Quick replies, when it is a question. */
  choices?: PipChoice[]
}

export interface VoiceContext {
  facts: PipFacts | null
  moments: readonly PipMoment[]
  /** The page's own pose ('sleep' on a rest day). */
  base: PipMood
  now: Date
}

export interface Draw {
  said: Said
  memory: PipMemory
}

type Random = () => number

/** How often a tap brings up one of your own moments rather than an everyday line. */
export const PERSONAL_SHARE = 0.6
/** How often the day's first tap asks a question, when there is one to ask. */
export const ASK_SHARE = 0.75

export const NOTHING_TO_LOOK_BACK_ON = "Nothing to look back on yet. Today is a great first page."

function weightedPick<T>(items: readonly T[], weight: (item: T) => number, random: Random): T {
  const total = items.reduce((sum, item) => sum + weight(item), 0)
  let point = random() * total
  for (const item of items) {
    point -= weight(item)
    if (point <= 0) return item
  }
  return items[items.length - 1]
}

const said = (m: PipMoment): Said => ({ id: m.id, text: m.text, mood: m.mood, personal: true, choices: m.choices })

/** Says a personal moment and remembers it (and that Pip asked a question today, if it is one). */
function sayMoment(m: PipMoment, memory: PipMemory, now: Date): Draw {
  const next = remember(memory, m, now)
  return { said: said(m), memory: m.choices ? { ...next, askedOn: localDateIso(now) } : next }
}

/** A line from one bank, advancing that bank's deck. */
export function drawFromPool(key: string, memory: PipMemory, random: Random): Draw {
  const pool = POOL_BY_KEY.get(key)
  if (!pool) throw new Error(`No bank of lines called ${key}`)
  const { index, deck } = drawLine(memory.decks[key] ?? null, pool.lines.length, random)
  return {
    said: { id: key, text: pool.lines[index], mood: pool.mood, personal: false },
    memory: { ...memory, decks: { ...memory.decks, [key]: deck } },
  }
}

/** An everyday line from whichever bank is next in today's deck of banks. */
export function drawGeneric(ctx: VoiceContext, memory: PipMemory, random: Random): Draw {
  const { key, deck } = drawKey(memory.pools, poolKeys(poolWeights(ctx.facts, ctx.base)), memory.lastPool, random)
  return drawFromPool(key, { ...memory, pools: deck, lastPool: key }, random)
}

/** The opening line: the most fitting thing Pip knows, else an everyday line. */
export function drawLaunch(ctx: VoiceContext, memory: PipMemory, random: Random = Math.random): Draw {
  const fresh = ctx.moments.filter((m) => !m.choices && isFresh(memory, m, ctx.now)).sort((a, b) => b.priority - a.priority)
  if (fresh.length === 0) return drawGeneric(ctx, memory, random)
  // Anything close to the top can open, so the same fact is not always first.
  const near = fresh.filter((m) => m.priority >= fresh[0].priority - 10)
  return sayMoment(weightedPick(near, (m) => m.priority, random), memory, ctx.now)
}

/** A tap: a question if one is waiting, else your own moments or an everyday line. */
export function drawTap(ctx: VoiceContext, memory: PipMemory, random: Random = Math.random): Draw {
  const fresh = ctx.moments.filter((m) => isFresh(memory, m, ctx.now))
  const question = fresh.find((m) => m.choices)
  if (question && memory.askedOn !== localDateIso(ctx.now) && random() < ASK_SHARE) return sayMoment(question, memory, ctx.now)
  const own = fresh.filter((m) => !m.choices)
  if (own.length > 0 && random() < PERSONAL_SHARE) return sayMoment(weightedPick(own, (m) => m.priority, random), memory, ctx.now)
  return drawGeneric(ctx, memory, random)
}

/** One of the three chips: a status, a throwback or a pep talk. */
export function drawTalk(kind: PipTalk, ctx: VoiceContext, memory: PipMemory, random: Random = Math.random): Draw {
  if (kind === 'progress' && ctx.facts) {
    const m = progressMoment(ctx.facts, memory.rounds)
    return { said: said(m), memory: { ...memory, rounds: memory.rounds + 1 } }
  }
  const all = ctx.moments.filter((m) => m.talk === kind && !m.choices)
  const fresh = all.filter((m) => isFresh(memory, m, ctx.now))
  // Everything has been said lately: bring back the one said longest ago rather than nothing.
  const pool = fresh.length > 0 ? fresh : [...all].sort((a, b) => (memory.seen[a.id] ?? 0) - (memory.seen[b.id] ?? 0)).slice(0, 1)

  if (kind === 'pep' && (pool.length === 0 || random() < 0.3)) return drawFromPool(random() < 0.5 ? 'theme:pep' : 'theme:mindset', memory, random)
  if (pool.length === 0) {
    const text = kind === 'throwback' ? NOTHING_TO_LOOK_BACK_ON : 'Log a workout and a weigh-in, and I will have plenty to say.'
    return { said: { id: `talk:${kind}:empty`, text, mood: 'wave', personal: false }, memory }
  }
  return sayMoment(weightedPick(pool, (m) => Math.max(1, m.priority), random), memory, ctx.now)
}
