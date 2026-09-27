import { describe, expect, it } from 'vitest'
import type { PipMood } from '../../components/pip/types'
import { buildPipFacts } from './facts'
import { NOW, input, monthOnACut, weighIn } from './fixtures.test-utils'
import { EMPTY_MEMORY, MAX_SEEN, isFresh, parseMemory, remember, type PipMemory } from './memory'
import { momentsFor } from './moments'
import { POOLS, POOL_BY_KEY, poolKeys, poolWeights } from './pools'
import type { PipMoment } from './types'
import { NOTHING_TO_LOOK_BACK_ON, PERSONAL_SHARE, drawFromPool, drawGeneric, drawLaunch, drawTalk, drawTap, type VoiceContext } from './voice'

/** A repeatable pseudo-random source. */
function seeded(seed: number) {
  let s = seed
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296
    return s / 4294967296
  }
}

const HOUR = 3_600_000
const facts = buildPipFacts(monthOnACut())
const ctx = (over: Partial<VoiceContext> = {}): VoiceContext => ({ facts, moments: momentsFor(facts), base: 'idle', now: NOW, ...over })
const fake = (id: string, over: Partial<PipMoment> = {}): PipMoment => ({ id, text: `text ${id}`, mood: null, topic: 'habit', priority: 50, cooldownHours: 24, ...over })

describe('memory', () => {
  it('starts empty and rejects anything that is not memory', () => {
    expect(parseMemory(null)).toEqual(EMPTY_MEMORY)
    expect(parseMemory('nope')).toEqual(EMPTY_MEMORY)
    expect(parseMemory(JSON.stringify({ v: 2 }))).toEqual(EMPTY_MEMORY)
    expect(parseMemory(JSON.stringify({ v: 1, decks: null, seen: {} }))).toEqual(EMPTY_MEMORY)
  })

  it('round-trips, and drops entries that are not numbers', () => {
    const memory: PipMemory = { ...EMPTY_MEMORY, seen: { a: 5 }, askedOn: '2026-09-26', rounds: 3, lastPool: 'theme:cut' }
    expect(parseMemory(JSON.stringify(memory))).toEqual(memory)
    expect(parseMemory(JSON.stringify({ ...memory, seen: { a: 5, b: 'x', c: null } })).seen).toEqual({ a: 5 })
    expect(parseMemory(JSON.stringify({ ...memory, rounds: -4 })).rounds).toBe(0)
  })

  it('treats a moment as fresh once its cooldown has passed', () => {
    const m = fake('x', { cooldownHours: 24 })
    let memory = EMPTY_MEMORY
    expect(isFresh(memory, m, NOW)).toBe(true)
    memory = remember(memory, m, NOW)
    expect(isFresh(memory, m, new Date(NOW.getTime() + 23 * HOUR))).toBe(false)
    expect(isFresh(memory, m, new Date(NOW.getTime() + 24 * HOUR))).toBe(true)
  })

  it('forgets the oldest moments past the limit', () => {
    let memory = EMPTY_MEMORY
    for (let i = 0; i < MAX_SEEN + 20; i += 1) memory = remember(memory, { id: `m${i}` }, new Date(NOW.getTime() + i * 1000))
    expect(Object.keys(memory.seen)).toHaveLength(MAX_SEEN)
    expect(memory.seen.m0).toBeUndefined()
    expect(memory.seen[`m${MAX_SEEN + 19}`]).toBeDefined()
  })
})

describe('the banks of everyday lines', () => {
  it('leans on the right banks for the day', () => {
    const idle = poolWeights(null, 'idle')
    expect(idle['theme:cut']).toBe(1)
    expect(idle['mood:sleep']).toBe(0)
    const rest = poolWeights(buildPipFacts(monthOnACut({ plan: { plan: { kind: 'rest' } } })), 'sleep')
    expect(rest['mood:sleep']).toBe(3)
    expect(rest['theme:recovery']).toBe(3)
    const cutting = poolWeights(facts, 'idle')
    expect(cutting['theme:cut']).toBe(3)
    const notCutting = poolWeights(buildPipFacts(input({ weights: [weighIn(0, 175)] })), 'idle')
    expect(notCutting['theme:cut']).toBe(0)
  })

  it('makes a bank come up in proportion to its weight', () => {
    const keys = poolKeys({ ...Object.fromEntries(POOLS.map((p) => [p.key, 0])), 'theme:cut': 3, 'theme:food': 1 })
    expect(keys.filter((k) => k === 'theme:cut')).toHaveLength(6)
    expect(keys.filter((k) => k === 'theme:food')).toHaveLength(2)
  })

  it('deals every line of a bank once before repeating any', () => {
    const size = POOL_BY_KEY.get('mood:flex')!.lines.length
    const random = seeded(3)
    let memory = EMPTY_MEMORY
    const seen: string[] = []
    for (let i = 0; i < size; i += 1) {
      const drawn = drawFromPool('mood:flex', memory, random)
      seen.push(drawn.said.text)
      memory = drawn.memory
    }
    expect(new Set(seen).size).toBe(size)
  })

  it('never uses the same bank twice in a row, and reaches many of them', () => {
    const random = seeded(11)
    let memory = EMPTY_MEMORY
    let last = ''
    const banks = new Set<string>()
    for (let i = 0; i < 200; i += 1) {
      const drawn = drawGeneric(ctx({ moments: [] }), memory, random)
      expect(drawn.said.id).not.toBe(last)
      last = drawn.said.id
      banks.add(last)
      memory = drawn.memory
    }
    expect(banks.size).toBeGreaterThan(20)
  })

  it('gives a line the gesture that belongs to its bank', () => {
    expect(drawFromPool('mood:flex', EMPTY_MEMORY, seeded(1)).said.mood).toBe('flex')
    expect(drawFromPool('mood:yawn', EMPTY_MEMORY, seeded(1)).said.mood).toBe('yawn')
    expect(drawFromPool('mood:idle', EMPTY_MEMORY, seeded(1)).said.mood).toBeNull()
    expect(drawFromPool('theme:mobility', EMPTY_MEMORY, seeded(1)).said.mood).toBe('stretch')
    expect(() => drawFromPool('theme:nope', EMPTY_MEMORY, seeded(1))).toThrow()
  })
})

describe('launch', () => {
  it('opens with something personal and important', () => {
    const { said } = drawLaunch(ctx(), EMPTY_MEMORY, seeded(1))
    expect(said.personal).toBe(true)
    const moment = ctx().moments.find((m) => m.id === said.id)!
    expect(moment.priority).toBeGreaterThanOrEqual(84)
  })

  it('does not open with the same thing twice', () => {
    const random = seeded(5)
    let memory = EMPTY_MEMORY
    const ids: string[] = []
    for (let i = 0; i < 6; i += 1) {
      const drawn = drawLaunch(ctx(), memory, random)
      ids.push(drawn.said.id)
      memory = drawn.memory
    }
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('never opens with a question', () => {
    const question = fake('ask:energy', { priority: 99, choices: [{ label: 'A', reply: 'a', mood: 'nod' }] })
    for (let i = 0; i < 20; i += 1) expect(drawLaunch(ctx({ moments: [question] }), EMPTY_MEMORY, seeded(i)).said.choices).toBeUndefined()
  })

  it('falls back to an everyday line when there is nothing to say', () => {
    const { said } = drawLaunch(ctx({ moments: [] }), EMPTY_MEMORY, seeded(1))
    expect(said.personal).toBe(false)
    expect(said.id).toMatch(/^(mood|theme):/)
  })

  it('remembers what it said', () => {
    const drawn = drawLaunch(ctx(), EMPTY_MEMORY, seeded(1))
    expect(drawn.memory.seen[drawn.said.id]).toBe(NOW.getTime())
  })
})

describe('tapping Pip', () => {
  it('mixes his own moments with everyday lines', () => {
    const random = seeded(21)
    const many = Array.from({ length: 400 }, (_, i) => fake(`m${i}`))
    let memory = EMPTY_MEMORY
    let personal = 0
    for (let i = 0; i < 300; i += 1) {
      const drawn = drawTap(ctx({ moments: many }), memory, random)
      if (drawn.said.personal) personal += 1
      memory = drawn.memory
    }
    expect(personal / 300).toBeGreaterThan(PERSONAL_SHARE - 0.12)
    expect(personal / 300).toBeLessThan(PERSONAL_SHARE + 0.12)
  })

  it('goes back to everyday lines when he has nothing new to say about you', () => {
    const only = [fake('one')]
    const random = seeded(2)
    let memory = EMPTY_MEMORY
    const ids: string[] = []
    for (let i = 0; i < 30; i += 1) {
      const drawn = drawTap(ctx({ moments: only }), memory, random)
      ids.push(drawn.said.id)
      memory = drawn.memory
    }
    expect(ids.filter((id) => id === 'one')).toHaveLength(1)
  })

  it('asks the question first, once a day, and no more', () => {
    const question = fake('ask:energy:today', { topic: 'checkin', choices: [{ label: 'Full tank', reply: 'Go get it.', mood: 'flex' }] })
    let memory = EMPTY_MEMORY
    let asked = 0
    for (let i = 0; i < 40; i += 1) {
      const drawn = drawTap(ctx({ moments: [question, fake('other')] }), memory, seeded(i))
      if (drawn.said.choices) {
        asked += 1
        expect(memory.askedOn).toBeNull()
        expect(drawn.memory.askedOn).not.toBeNull()
      }
      memory = drawn.memory
    }
    expect(asked).toBe(1)
  })

  it('carries a moment\'s gesture along', () => {
    const drawn = drawTap(ctx({ moments: [fake('a', { mood: 'celebrate', priority: 90 })] }), EMPTY_MEMORY, () => 0)
    expect(drawn.said.mood).toBe('celebrate')
    const mood: PipMood | null = drawn.said.mood
    expect(mood).not.toBeNull()
  })
})

describe('the three chips', () => {
  it('"How am I doing?" rotates through training, body and strength', () => {
    let memory = EMPTY_MEMORY
    const texts: string[] = []
    for (let i = 0; i < 3; i += 1) {
      const drawn = drawTalk('progress', ctx(), memory, seeded(1))
      texts.push(drawn.said.text)
      memory = drawn.memory
    }
    expect(texts[0]).toMatch(/workout/)
    expect(texts[1]).toMatch(/209\.8 lb/)
    expect(texts[2]).toMatch(/→/)
    expect(memory.rounds).toBe(3)
  })

  it('"Throwback" brings up a memory, then a different one', () => {
    const random = seeded(4)
    let memory = EMPTY_MEMORY
    const first = drawTalk('throwback', ctx(), memory, random)
    memory = first.memory
    const second = drawTalk('throwback', ctx(), memory, random)
    expect(first.said.personal).toBe(true)
    expect(second.said.id).not.toBe(first.said.id)
    expect(ctx().moments.find((m) => m.id === first.said.id)!.talk).toBe('throwback')
  })

  it('"Throwback" is kind when there is nothing to look back on', () => {
    const empty = buildPipFacts(input())
    const drawn = drawTalk('throwback', { facts: empty, moments: momentsFor(empty), base: 'idle', now: NOW }, EMPTY_MEMORY, seeded(1))
    expect(drawn.said.text).toBe(NOTHING_TO_LOOK_BACK_ON)
  })

  it('"Throwback" repeats the oldest memory rather than going quiet once all have been said', () => {
    const all = ctx().moments.filter((m) => m.talk === 'throwback')
    let memory = EMPTY_MEMORY
    for (const m of all) memory = remember(memory, m, NOW)
    const drawn = drawTalk('throwback', ctx(), memory, seeded(1))
    expect(drawn.said.personal).toBe(true)
  })

  it('"Pep talk" names your goal at least some of the time', () => {
    const random = seeded(9)
    let memory = EMPTY_MEMORY
    let goal = 0
    for (let i = 0; i < 60; i += 1) {
      const drawn = drawTalk('pep', ctx(), memory, random)
      if (/180/.test(drawn.said.text)) goal += 1
      memory = drawn.memory
    }
    expect(goal).toBeGreaterThan(0)
  })

  it('"Pep talk" still works with no history', () => {
    const empty = buildPipFacts(input())
    const drawn = drawTalk('pep', { facts: empty, moments: momentsFor(empty), base: 'idle', now: NOW }, EMPTY_MEMORY, seeded(1))
    expect(drawn.said.text.length).toBeGreaterThan(10)
  })
})
