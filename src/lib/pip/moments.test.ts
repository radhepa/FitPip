import { describe, expect, it } from 'vitest'
import { PLATES_A_SIDE } from '../../config/pip/comparisons'
import { ex } from '../rankFixtures.test-utils'
import { buildPipFacts } from './facts'
import { NOW, bench, cableRow, daysAgo, input, logged, monthOnACut, squat, weighIn, workout } from './fixtures.test-utils'
import { momentsFor, progressMoment } from './moments'
import type { PipMoment } from './types'

const moments = (data = monthOnACut(), options?: { askedToday: boolean }) => momentsFor(buildPipFacts(data), options)
const byId = (list: PipMoment[], prefix: string) => list.find((m) => m.id.startsWith(prefix))
const allText = (list: PipMoment[]) => list.flatMap((m) => [m.text, ...(m.choices?.flatMap((c) => [c.label, c.reply]) ?? [])])

describe('personal moments for a month on a cut', () => {
  const list = moments()

  it('celebrates the record set two days ago, with the old and new numbers', () => {
    const record = byId(list, 'lift:record:bench')!
    expect(record.priority).toBeGreaterThanOrEqual(95)
    expect(record.mood).toBe('celebrate')
    expect(record.text).toMatch(/Bench Press/)
    expect(record.text).toMatch(/155/)
    expect(record.text).toMatch(/145/)
  })

  it('remembers what you lifted two weeks ago and what you lift now', () => {
    const story = byId(list, 'lift:weeks:bench')!
    expect(story.text).toMatch(/two weeks ago/i)
    expect(story.text).toMatch(/135/)
    expect(story.text).toMatch(/155/)
    expect(story.text).toMatch(/Bench Press/)
    expect(story.talk).toBe('throwback')
  })

  it('remembers where a lift started, too', () => {
    const story = byId(list, 'lift:start:bench')!
    expect(story.text).toMatch(/115/)
    expect(story.text).toMatch(/155/)
  })

  it('talks about the goal with the real numbers', () => {
    expect(byId(list, 'weight:togo')!.text).toMatch(/29\.8/)
    expect(byId(list, 'weight:togo')!.text).toMatch(/180/)
    expect(byId(list, 'weight:down')!.text).toMatch(/0\.6/)
    expect(byId(list, 'weight:low')!.text).toMatch(/209\.8/)
    expect(byId(list, 'weight:since')!.text).toMatch(/5\.6/)
  })

  it('notices lighter and stronger, the point of cutting well', () => {
    const recomp = byId(list, 'lift:recomp')!
    expect(recomp.text).toMatch(/5\.6 lb/)
    expect(recomp.text).toMatch(/40 lb/)
    expect(recomp.text).toMatch(/0\.53/)
    expect(recomp.text).toMatch(/0\.74/)
  })

  it('marks a first time over a plate weight', () => {
    const round = byId(list, 'lift:round:bench:135')!
    expect(round.text).toMatch(/135/)
    expect(round.text).toMatch(new RegExp(PLATES_A_SIDE[135]))
  })

  it('has unique ids and never leaves a slot or a NaN in the words', () => {
    const ids = list.map((m) => m.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const text of allText(list)) expect(text, text).not.toMatch(/[{}]|undefined|NaN|null|\s{2}/)
  })

  it('keeps every line to a length the speech bubble can hold', () => {
    for (const m of list) expect(m.text.length, m.text).toBeLessThanOrEqual(170)
  })
})

describe('the same wording all day, another tomorrow', () => {
  it('repeats itself within a day', () => {
    expect(moments().map((m) => m.text)).toEqual(moments().map((m) => m.text))
  })

  it('varies across days', () => {
    const tomorrow = { ...monthOnACut(), now: new Date(NOW.getTime() + 86_400_000) }
    const today = new Set(moments().map((m) => m.text))
    const later = moments(tomorrow).map((m) => m.text)
    expect(later.filter((t) => !today.has(t)).length).toBeGreaterThan(0)
  })
})

describe('names', () => {
  it('uses the display name only when there is one', () => {
    const named = moments(monthOnACut({ displayName: 'Alex Kim' }))
    const anonymous = moments(monthOnACut({ displayName: null }))
    expect(allText(named).join(' ')).toMatch(/Alex/)
    expect(allText(named).join(' ')).not.toMatch(/Kim/)
    expect(allText(anonymous).join(' ')).not.toMatch(/friend,|Alex/)
  })
})

describe('weight moments', () => {
  const goal = { weight: 180, unit: 'lb' as const }

  it('greets a first weigh-in with the size of the job', () => {
    const list = moments(input({ weights: [weighIn(0, 215.4)], goal }))
    expect(byId(list, 'weight:first')!.text).toMatch(/215\.4/)
    expect(byId(list, 'weight:first')!.text).toMatch(/35\.4/)
  })

  it('asks for a first weigh-in when there are none', () => {
    expect(byId(moments(input()), 'weight:none')).toBeTruthy()
  })

  it('celebrates the goal', () => {
    const list = moments(input({ weights: [weighIn(40, 215), weighIn(20, 200), weighIn(0, 179.6)], goal }))
    const reached = byId(list, 'weight:reached')!
    expect(reached.priority).toBeGreaterThanOrEqual(90)
    expect(reached.text).toMatch(/180/)
  })

  it('marks halfway', () => {
    const list = moments(input({ weights: [weighIn(40, 200), weighIn(20, 190.5), weighIn(1, 189), weighIn(0, 189.5)], goal: { weight: 180, unit: 'lb' } }))
    expect(byId(list, 'weight:goal:50')).toBeTruthy()
  })

  it('is gentle about a fast drop', () => {
    const list = moments(input({ weights: [weighIn(14, 216), weighIn(7, 215), weighIn(0, 210.5)], goal }))
    expect(byId(list, 'weight:down')!.text).toMatch(/fast|quick/i)
    expect(byId(list, 'weight:down')!.text).toMatch(/eat|fuel|protein/i)
  })

  it('is kind about a gain while cutting, and points at the trend', () => {
    const list = moments(input({ weights: [weighIn(30, 215), weighIn(7, 209), weighIn(0, 210.4)], goal }))
    const up = byId(list, 'weight:up')!
    expect(up.text).toMatch(/1\.4/)
    expect(up.text).not.toMatch(/fail|bad|fat|lazy/i)
  })

  it('notices a plateau', () => {
    const list = moments(input({ weights: [weighIn(20, 200.2), weighIn(14, 200), weighIn(7, 200.3), weighIn(1, 200.1)], goal }))
    expect(byId(list, 'weight:flat')).toBeTruthy()
  })

  it('nudges after a few days without stepping on', () => {
    const list = moments(input({ weights: [weighIn(12, 200), weighIn(6, 199)], goal }))
    expect(byId(list, 'weight:stale')!.text).toMatch(/6 days/)
  })

  it('counts up for a bulk', () => {
    const list = moments(input({ weights: [weighIn(20, 170), weighIn(0, 173.5)], goal: { weight: 185, unit: 'lb' } }))
    expect(byId(list, 'weight:gain')!.text).toMatch(/3\.5/)
    expect(byId(list, 'weight:down')).toBeUndefined()
  })

  it('suggests a goal when there is none', () => {
    expect(byId(moments(input({ weights: [weighIn(9, 200), weighIn(0, 199)] })), 'weight:nogoal')).toBeTruthy()
  })

  it('speaks in kilograms when that is the unit', () => {
    const list = moments(input({ unit: 'kg', goal: { weight: 80, unit: 'kg' }, weights: [weighIn(0, 97.7, 'kg')] }))
    expect(byId(list, 'weight:first')!.text).toMatch(/97\.7 kg/)
    expect(byId(list, 'weight:first')!.text).toMatch(/17\.7/)
  })
})

describe('habit moments', () => {
  it('cheers a streak of days and remembers the milestone counts', () => {
    const list = moments(input({ sessions: [workout(0), workout(1), workout(2), workout(3), workout(4)] }))
    const streak = byId(list, 'habit:streak')!
    expect(streak.id).toBe('habit:streak:5')
    expect(streak.priority).toBe(80)
  })

  it('welcomes you back after a break, and eases you in after a long one', () => {
    const short = moments(input({ sessions: [workout(30), workout(28), workout(6)] }))
    expect(byId(short, 'habit:comeback')!.text).toMatch(/6 days/)
    const long = moments(input({ sessions: [workout(40), workout(38), workout(20)] }))
    expect(byId(long, 'habit:comeback')!.text).toMatch(/20 days/)
    expect(byId(long, 'habit:comeback')!.text).toMatch(/half|easy|ease|hello/i)
  })

  it('marks workout number ten, but only when it was recent', () => {
    const recent = Array.from({ length: 10 }, (_, i) => workout(i * 3 + 1))
    expect(byId(moments(input({ sessions: recent })), 'habit:milestone:10')).toBeTruthy()
    const old = Array.from({ length: 10 }, (_, i) => workout(i * 3 + 20))
    expect(byId(moments(input({ sessions: old })), 'habit:milestone')).toBeUndefined()
  })

  it('says something about a muscle group that has been missing', () => {
    const w = [workout(30), workout(25), workout(20), workout(15), workout(9), workout(1)]
    const rows = [...w.slice(0, 5).map((s) => logged(s, squat, { weight: 135, reps: 5 })), logged(w[5], bench, { weight: 100, reps: 5 })]
    const gap = byId(moments(input({ sessions: w, sets: rows })), 'habit:gap')!
    expect(gap.text).toMatch(/legs/i)
    expect(gap.text).toMatch(/9 days/)
  })

  it('counts single-arm sets', () => {
    const w = [workout(3), workout(6)]
    const rows = Array.from({ length: 8 }, (_, i) => logged(w[i % 2], cableRow, { weight: 40, reps: 10 }))
    expect(byId(moments(input({ sessions: w, sets: rows })), 'lift:singlearm')!.text).toMatch(/8/)
  })
})

describe('lift moments', () => {
  it('spots a lift that has stopped climbing', () => {
    const days = [40, 33, 26, 19, 12, 5]
    const w = days.map((d) => workout(d))
    const weights = [135, 145, 155, 155, 155, 155]
    const rows = w.map((s, i) => logged(s, bench, { weight: weights[i], reps: 5 }))
    const stall = byId(moments(input({ sessions: w, sets: rows })), 'lift:stall')!
    expect(stall.text).toMatch(/Bench Press/)
    expect(stall.text).toMatch(/155/)
  })

  it('marks a lift reaching your bodyweight', () => {
    const w = [workout(30), workout(20), workout(3)]
    const rows = [logged(w[0], bench, { weight: 165, reps: 5 }), logged(w[1], bench, { weight: 185, reps: 5 }), logged(w[2], bench, { weight: 205, reps: 3 })]
    const list = moments(input({ sessions: w, sets: rows, weights: [weighIn(2, 200)] }))
    expect(byId(list, 'lift:bodyweight:bench')!.text).toMatch(/your bodyweight/)
  })

  it('marks the first 225 with the plates', () => {
    const w = [workout(40), workout(20), workout(3)]
    const rows = [logged(w[0], squat, { weight: 185, reps: 5 }), logged(w[1], squat, { weight: 205, reps: 5 }), logged(w[2], squat, { weight: 225, reps: 3 })]
    expect(byId(moments(input({ sessions: w, sets: rows })), 'lift:round:squat:225')!.text).toMatch(/two plates a side/)
  })

  it('tells the story for bodyweight reps', () => {
    const pull = ex('pull', 'Pull-Up', { equipment: 'bodyweight' })
    const w = [workout(30), workout(14), workout(2)]
    const rows = [logged(w[0], pull, { reps: 3 }), logged(w[1], pull, { reps: 5 }), logged(w[2], pull, { reps: 8 })]
    const story = byId(moments(input({ exercises: [pull], sessions: w, sets: rows })), 'lift:weeks:pull')!
    expect(story.text).toMatch(/5/)
    expect(story.text).toMatch(/8/)
    expect(story.text).toMatch(/Pull-Up/)
  })

  it('compares your total with something heavy', () => {
    const w = workout(3)
    const rows = Array.from({ length: 70 }, () => logged(w, squat, { weight: 225, reps: 5 }))
    expect(byId(moments(input({ sessions: [w], sets: rows })), 'lift:volume')!.text).toMatch(/78,750|about \d+ (small cars|pickup trucks|elephants)|about an elephant|about a pickup/)
  })
})

describe('today', () => {
  it('has a greeting for the time of day, and a weekday line', () => {
    const list = moments(input())
    expect(byId(list, 'plan:greeting')).toBeTruthy()
    expect(byId(list, 'plan:weekday')!.text).toMatch(/Saturday/)
  })

  it('needs no plan', () => {
    expect(() => moments(input({ plan: null }))).not.toThrow()
  })

  it('says the day is done after a workout', () => {
    const w = workout(0, { hour: 8 })
    const list = moments(input({ sessions: [w], sets: [logged(w, bench, { weight: 100, reps: 5 }), logged(w, bench, { weight: 100, reps: 5 })] }))
    expect(byId(list, 'plan:done')!.text).toMatch(/2 sets|food|Nice work|rebuild/)
  })
})

describe('the status chip', () => {
  const facts = buildPipFacts(monthOnACut())

  it('rotates between training, body and strength', () => {
    expect(progressMoment(facts, 0).text).toMatch(/workout this week/)
    expect(progressMoment(facts, 1).text).toMatch(/209\.8 lb, down 0\.6 this week\. 29\.8 lb to 180/)
    expect(progressMoment(facts, 2).text).toMatch(/Bench Press 115 → 155 lb/)
    expect(progressMoment(facts, 3).text).toBe(progressMoment(facts, 0).text)
  })

  it('says how many in all and what the last one was', () => {
    expect(progressMoment(facts, 0).text).toBe('1 workout this week. 6 in all. Last one: Upper body, two days ago.')
  })

  it('has something kind to say with no history at all', () => {
    const empty = buildPipFacts(input())
    expect(progressMoment(empty, 0).text).toMatch(/No workouts logged yet/)
    expect(progressMoment(empty, 1).text).toMatch(/No weigh-ins yet/)
    expect(progressMoment(empty, 2).text).toMatch(/No lifts logged yet/)
  })
})

describe('check-in questions', () => {
  const planned = () => {
    const routine = { template: { id: 't', user_id: 'u', name: 'Push day', created_at: '', updated_at: '' }, items: [{ id: 'i', user_id: 'u', template_id: 't', exercise_id: 'bench', position: 0, target_sets: 3, target_reps: 8, target_seconds: null, created_at: '', updated_at: '' }] }
    return { plan: { kind: 'planned' as const, entries: [{ kind: 'routine' as const, item: { id: 'p', user_id: 'u', weekday: 6, position: 0, template_id: 't', exercise_id: null, category: null, created_at: '', updated_at: '' }, routine }] }, week: { planned: 4, done: 1 } }
  }

  const days = Array.from({ length: 60 }, (_, i) => new Date(2026, 8, 26 - i, 9))
  const asks = days.map((now) => ({ now, list: momentsFor(buildPipFacts(monthOnACut({ now, plan: planned() }))) })).map(({ now, list }) => ({ now, ask: list.find((m) => m.choices) }))

  it('asks on some days and not others', () => {
    const count = asks.filter((a) => a.ask).length
    expect(count).toBeGreaterThan(8)
    expect(count).toBeLessThan(40)
  })

  it('offers three quick replies that are fully written out', () => {
    for (const { ask } of asks) {
      if (!ask) continue
      expect(ask.choices).toHaveLength(3)
      for (const c of ask.choices!) expect(c.reply.length).toBeGreaterThan(10)
    }
  })

  it('brings up what you did last time on the first lift', () => {
    const replies = asks.flatMap(({ ask }) => ask?.choices?.map((c) => c.reply) ?? [])
    expect(replies.some((r) => /Last time on Bench Press: 155 lb × 5/.test(r))).toBe(true)
  })

  it('does not ask twice in a day, before 9 pm, or when there is nothing to do', () => {
    const now = asks.find((a) => a.ask)!.now
    expect(momentsFor(buildPipFacts(monthOnACut({ now, plan: planned() })), { askedToday: true }).some((m) => m.choices)).toBe(false)
    expect(momentsFor(buildPipFacts(monthOnACut({ now: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 22), plan: planned() }))).some((m) => m.choices)).toBe(false)
    expect(momentsFor(buildPipFacts(monthOnACut({ now, plan: { plan: { kind: 'rest' }, week: { planned: 4, done: 1 } } }))).some((m) => m.choices)).toBe(false)
  })

  it('does not quote minutes for a day that is just a kind of workout', () => {
    const item = { id: 'p', user_id: 'u', weekday: 6, position: 0, template_id: null, exercise_id: null, category: 'strength' as const, created_at: '', updated_at: '' }
    const category = { plan: { kind: 'planned' as const, entries: [{ kind: 'category' as const, item, category: 'strength' as const }] }, week: { planned: 1, done: 0 } }
    for (let i = 0; i < 12; i += 1) {
      const now = new Date(2026, 8, 26 - i, 9)
      const today = momentsFor(buildPipFacts(input({ now, plan: category }))).find((m) => m.id.startsWith('plan:today'))!
      expect(today.text, today.text).not.toMatch(/minutes/)
      expect(today.text).toMatch(/Weightlifting/)
    }
  })

  it('reads today\'s plan into the lineup line', () => {
    const facts = buildPipFacts(monthOnACut({ plan: planned() }))
    const today = momentsFor(facts).find((m) => m.id.startsWith('plan:today'))!
    expect(today.text).toMatch(/Push day/)
    expect(daysAgo(0)).toBeTruthy()
  })
})
