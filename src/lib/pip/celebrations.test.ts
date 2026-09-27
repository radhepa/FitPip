import { describe, expect, it } from 'vitest'
import { PIP_CELEBRATIONS } from '../../config/pipCelebrations'
import { chooseCelebration, parseCelebrations, type CelebrationMemory } from './celebrations'

describe('workout celebration rotation', () => {
  it('shows all five finishes before repeating, including across app launches', () => {
    let memory: CelebrationMemory | null = null
    let previous: string | null = null
    for (let round = 0; round < 8; round++) {
      const seen = new Set<string>()
      for (let i = 0; i < PIP_CELEBRATIONS.length; i++) {
        const next = chooseCelebration(memory, `${round}-${i}`, false, () => .3)
        expect(next.celebration.id).not.toBe(previous)
        seen.add(next.celebration.id)
        previous = next.celebration.id
        memory = parseCelebrations(JSON.stringify(next.memory))
      }
      expect(seen.size).toBe(PIP_CELEBRATIONS.length)
    }
  })

  it('keeps the same selection on remount, but explicitly asking for another advances', () => {
    const first = chooseCelebration(null, 'workout-a', false, () => .5)
    const replay = chooseCelebration(first.memory, 'workout-a')
    expect(replay).toEqual(first)
    const another = chooseCelebration(replay.memory, 'workout-a', true, () => .5)
    expect(another.celebration.id).not.toBe(first.celebration.id)
    expect(another.memory.deck!.order).toHaveLength(PIP_CELEBRATIONS.length - 2)
  })

  it('does not count rerenders or replaying a saved choice as extra workouts', () => {
    const first = chooseCelebration(null, 'workout-a')
    for (let i = 0; i < 10; i++) {
      const replay = chooseCelebration(parseCelebrations(JSON.stringify(first.memory)), 'workout-a')
      expect(replay.memory).toEqual(first.memory)
    }
  })

  it('recovers from malformed, duplicated, obsolete, or empty storage', () => {
    for (const raw of [null, 'null', 'broken', '[]', '{}', '{"deck":{"order":42}}']) {
      expect(PIP_CELEBRATIONS).toContain(chooseCelebration(parseCelebrations(raw), 'new').celebration)
    }
    const ids = PIP_CELEBRATIONS.map(({ id }) => id)
    for (const order of [[ids[1], ids[1]], [ids[0]], ['retired']]) {
      const parsed = parseCelebrations(JSON.stringify({ deck: { sig: ids.join(','), order }, last: ids[0] }))
      expect(parsed?.deck).toBeNull()
      expect(chooseCelebration(parsed, 'new').celebration.id).not.toBe(ids[0])
    }
    const outdated = parseCelebrations(JSON.stringify({ deck: { sig: 'old-bank', order: [ids[1]] }, last: ids[0] }))
    expect(outdated?.deck).toBeNull()
    expect(chooseCelebration(outdated, 'new').memory.deck!.order).toHaveLength(ids.length - 1)
  })
})
