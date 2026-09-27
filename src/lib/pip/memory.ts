// What Pip remembers between launches: which lines are next in each deck, and which personal moments
// he has said lately (so he doesn't repeat himself). Kept in localStorage by hooks/usePipVoice.
import type { PipDeck, KeyDeck } from '../pipDeck'
import type { PipMoment } from './types'

export interface PipMemory {
  v: 1
  /** The next lines in each bank of generic lines. */
  decks: Record<string, PipDeck>
  /** Which bank of generic lines comes next, and the one used last. */
  pools: KeyDeck | null
  lastPool: string | null
  /** When each personal moment was last said (ms since epoch). */
  seen: Record<string, number>
  /** The day (YYYY-MM-DD) Pip last asked a question. */
  askedOn: string | null
  /** How many "How am I doing?" answers have been given, to rotate through them. */
  rounds: number
}

export const EMPTY_MEMORY: PipMemory = { v: 1, decks: {}, pools: null, lastPool: null, seen: {}, askedOn: null, rounds: 0 }

/** The most moments remembered; the oldest are forgotten first. */
export const MAX_SEEN = 300

const HOUR_MS = 3_600_000

/** Reads stored memory, or a fresh one if it is missing or not memory. */
export function parseMemory(raw: string | null): PipMemory {
  if (!raw) return EMPTY_MEMORY
  try {
    const value = JSON.parse(raw) as Partial<PipMemory>
    if (value.v !== 1 || typeof value.decks !== 'object' || value.decks === null || typeof value.seen !== 'object' || value.seen === null) return EMPTY_MEMORY
    const seen = Object.fromEntries(Object.entries(value.seen).filter(([, at]) => typeof at === 'number' && Number.isFinite(at)))
    const pools = value.pools && Array.isArray(value.pools.order) && typeof value.pools.sig === 'string' ? value.pools : null
    return {
      v: 1,
      decks: value.decks as PipMemory['decks'],
      pools,
      lastPool: typeof value.lastPool === 'string' ? value.lastPool : null,
      seen,
      askedOn: typeof value.askedOn === 'string' ? value.askedOn : null,
      rounds: typeof value.rounds === 'number' && Number.isFinite(value.rounds) ? Math.max(0, Math.floor(value.rounds)) : 0,
    }
  } catch {
    return EMPTY_MEMORY
  }
}

/** True if this moment has not been said within its cooldown. */
export const isFresh = (memory: PipMemory, moment: Pick<PipMoment, 'id' | 'cooldownHours'>, now: Date): boolean => {
  const at = memory.seen[moment.id]
  return at === undefined || now.getTime() - at >= moment.cooldownHours * HOUR_MS
}

/** Notes that a moment was just said, forgetting the oldest ones past MAX_SEEN. */
export function remember(memory: PipMemory, moment: Pick<PipMoment, 'id'>, now: Date): PipMemory {
  const seen = { ...memory.seen, [moment.id]: now.getTime() }
  const ids = Object.keys(seen)
  if (ids.length > MAX_SEEN) {
    const oldest = ids.sort((a, b) => seen[a] - seen[b]).slice(0, ids.length - MAX_SEEN)
    for (const id of oldest) delete seen[id]
  }
  return { ...memory, seen }
}
