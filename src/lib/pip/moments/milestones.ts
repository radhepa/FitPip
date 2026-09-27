// Pip's bigger moments: round numbers, plates, bodyweight multiples, getting lighter and stronger,
// and everything you have lifted so far.
import { BODYWEIGHT_MULTIPLES, PLATES_A_SIDE, PLATE_MILESTONES, WEIGHT_COMPARISONS } from '../../../config/pip/comparisons'
import {
  BODYWEIGHT_LINES,
  FAVOURITE_LINES,
  PLATE_LINES,
  RECOMP_LINES,
  ROUND_LINES,
  SINGLE_ARM_LINES,
  VOLUME_LINES,
} from '../../../config/pip/personalLines'
import { findStandard } from '../../../config/strengthStandards'
import { weightNear } from '../bodyFacts'
import type { PipFacts } from '../facts'
import { bestDay } from '../liftFacts'
import type { PipMoment } from '../types'
import { moment, num, say } from './say'

/** First time over a barbell weight that means something (135, 225, 315, ...). */
export function roundMoments(facts: PipFacts): PipMoment[] {
  const marks = PLATE_MILESTONES[facts.unit]
  const out: PipMoment[] = []
  for (const history of facts.lifts) {
    if (history.kind !== 'load' || history.exercise.equipment !== 'barbell') continue
    const mark = Math.max(0, ...marks.filter((m) => history.days.some((d) => d.weight >= m)))
    const first = history.days.find((d) => d.weight >= mark)
    if (!mark || !first || first === history.days[0] || first.ageDays > 14) continue
    const id = `lift:round:${history.exercise.id}:${mark}`
    const plates = facts.unit === 'lb' ? PLATES_A_SIDE[mark] : undefined
    const slots = { lift: history.exercise.name, w: mark, unit: facts.unit, plates: plates ?? '' }
    out.push(moment({ id, text: say(facts, id, plates ? PLATE_LINES : ROUND_LINES, slots), topic: 'lift', priority: 84, cooldownHours: 240, mood: 'celebrate', talk: 'throwback', on: first.day }))
  }
  return out.slice(0, 2)
}

const multiplePhrase = (m: number) => (m === 1 ? 'your bodyweight' : m < 1 ? `${Math.round(m * 100)}% of your bodyweight` : `${m}× your bodyweight`)

/** A main lift that just reached a multiple of your bodyweight. */
export function bodyweightMoments(facts: PipFacts): PipMoment[] {
  const bodyweight = facts.weight?.latest
  if (!bodyweight) return []
  const out: PipMoment[] = []
  for (const history of facts.lifts) {
    const multiples = BODYWEIGHT_MULTIPLES[findStandard(history.exercise)?.key ?? '']
    if (history.kind !== 'load' || !multiples) continue
    const recent = bestDay(history.days.filter((d) => d.ageDays <= 14))
    const before = bestDay(history.days.filter((d) => d.ageDays > 14))
    if (!recent || !before) continue
    const reached = multiples.filter((m) => recent.weight >= m * bodyweight && before.weight < m * bodyweight)
    if (reached.length === 0) continue
    const mult = Math.max(...reached)
    const id = `lift:bodyweight:${history.exercise.id}:${mult}`
    const text = say(facts, id, BODYWEIGHT_LINES, { lift: history.exercise.name, mult: multiplePhrase(mult), w: num(recent.weight), unit: facts.unit })
    out.push(moment({ id, text, topic: 'lift', priority: 88, cooldownHours: 300, mood: 'celebrate', talk: 'throwback', on: recent.day }))
  }
  return out.slice(0, 1)
}

/** Lighter on the scale and heavier on the bar: the whole point of cutting well. */
export function recompMoments(facts: PipFacts): PipMoment[] {
  const w = facts.weight
  if (!w || w.direction !== 'lose') return []
  const lostMin = facts.unit === 'kg' ? 1 : 2
  const gainedMin = facts.unit === 'kg' ? 2 : 5
  let best: { ratio: number; moment: PipMoment } | null = null
  for (const history of facts.lifts) {
    if (history.kind !== 'load' || !BODYWEIGHT_MULTIPLES[findStandard(history.exercise)?.key ?? ''] || history.days.length < 3) continue
    const first = history.days[0]
    const now = bestDay(history.days.filter((d) => d.ageDays <= 21))
    const then = weightNear(facts.weighIns, first.day, 10)
    if (!now || then === null || first.ageDays < 14 || now.ageDays >= first.ageDays) continue
    const lost = then - w.latest
    const gained = now.weight - first.weight
    const before = first.weight / then
    const after = now.weight / w.latest
    if (lost < lostMin || gained < gainedMin || after < before * 1.1) continue
    const id = `lift:recomp:${history.exercise.id}:${now.day}`
    const text = say(facts, id, RECOMP_LINES, { lift: history.exercise.name, lost: num(lost), gained: num(gained), unit: facts.unit, then: before.toFixed(2), now: after.toFixed(2) })
    if (!best || after / before > best.ratio) best = { ratio: after / before, moment: moment({ id, text, topic: 'lift', priority: 64, cooldownHours: 96, mood: 'flex', talk: 'throwback' }) }
  }
  return best ? [best.moment] : []
}

/** Everything you have lifted, next to something heavy. */
export function volumeMoments(facts: PipFacts): PipMoment[] {
  const total = facts.habit.totalVolume
  const pounds = facts.unit === 'kg' ? total * 2.20462 : total
  const thing = [...WEIGHT_COMPARISONS].reverse().find((c) => pounds >= c.lb)
  if (!thing) return []
  const count = Math.round(pounds / thing.lb)
  const id = `lift:volume:${thing.lb}`
  const text = say(facts, id, VOLUME_LINES, { total: Math.round(total).toLocaleString(), unit: facts.unit, thing: count <= 1 ? `about ${thing.one}` : `about ${count} ${thing.many}` })
  return [moment({ id, text, topic: 'lift', priority: 45, cooldownHours: 200, mood: 'flex', talk: 'throwback' })]
}

export function favouriteMoments(facts: PipFacts): PipMoment[] {
  const fav = facts.habit.mostLogged
  if (!fav || fav.sets < 8) return []
  const id = `lift:favourite:${fav.exercise.id}`
  return [moment({ id, text: say(facts, id, FAVOURITE_LINES, { lift: fav.exercise.name, n: fav.sets }), topic: 'lift', priority: 44, cooldownHours: 200, mood: 'love', talk: 'throwback' })]
}

export function singleArmMoments(facts: PipFacts): PipMoment[] {
  const n = facts.habit.singleArmSets
  if (n < 6) return []
  const id = `lift:singlearm:${Math.floor(n / 10) * 10}`
  return [moment({ id, text: say(facts, id, SINGLE_ARM_LINES, { n }), topic: 'lift', priority: 46, cooldownHours: 200, mood: 'flex', talk: 'throwback' })]
}
