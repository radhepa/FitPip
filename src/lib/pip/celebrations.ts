import { PIP_CELEBRATIONS } from '../../config/pipCelebrations'
import { drawKey, type KeyDeck } from '../pipDeck'

export interface CelebrationMemory {
  deck: KeyDeck | null
  last: string | null
  sessionId: string | null
}

const ids = PIP_CELEBRATIONS.map(({ id }) => id)

/** Invalid or outdated storage must never stop a saved workout from being shown. */
export function parseCelebrations(raw: string | null): CelebrationMemory | null {
  if (!raw) return null
  try {
    const value = JSON.parse(raw) as Partial<CelebrationMemory> | null
    if (!value || typeof value !== 'object') return null
    const last = ids.find((id) => id === value.last) ?? null
    const candidate = value.deck
    const order = candidate?.order
    const valid = candidate?.sig === ids.join(',') && Array.isArray(order)
      && order.every((id) => ids.some((known) => known === id) && id !== last)
      && new Set(order).size === order.length
    return {
      deck: valid ? { sig: candidate.sig, order: [...order] } : null,
      last,
      sessionId: last && typeof value.sessionId === 'string' ? value.sessionId : null,
    }
  } catch {
    return null
  }
}

/** Deal every finish once per round, with no repeat at the boundary between rounds. */
export function chooseCelebration(memory: CelebrationMemory | null, sessionId: string, another = false, random = Math.random) {
  const previous = PIP_CELEBRATIONS.find(({ id }) => id === memory?.last)
  if (!another && previous && memory?.sessionId === sessionId) return { celebration: previous, memory }
  const next = drawKey(memory?.deck ?? null, ids, memory?.last ?? null, random)
  const celebration = PIP_CELEBRATIONS.find(({ id }) => id === next.key)!
  return { celebration, memory: { deck: next.deck, last: celebration.id, sessionId } }
}
