import type { PipFacts } from '../facts'
import type { PipMoment } from '../types'
import { weightMoments } from './body'
import { cardioMoments } from './cardio'
import { checkinMoments, type CheckinOptions } from './checkin'
import { habitMoments } from './habit'
import { heaviestMoments, recordMoments, stallMoments, storyMoments } from './lifts'
import { bodyweightMoments, favouriteMoments, recompMoments, roundMoments, singleArmMoments, volumeMoments } from './milestones'
import { pepMoments } from './pep'
import { planMoments } from './plan'

export { progressMoment } from './summary'
export type { CheckinOptions } from './checkin'

/** Everything Pip could say right now, from your history. Unranked: lib/pip/voice.ts decides what to say. */
export function momentsFor(facts: PipFacts, options: CheckinOptions = { askedToday: false }): PipMoment[] {
  return [
    ...recordMoments(facts),
    ...roundMoments(facts),
    ...bodyweightMoments(facts),
    ...habitMoments(facts),
    ...weightMoments(facts),
    ...planMoments(facts),
    ...storyMoments(facts),
    ...recompMoments(facts),
    ...stallMoments(facts),
    ...heaviestMoments(facts),
    ...volumeMoments(facts),
    ...favouriteMoments(facts),
    ...singleArmMoments(facts),
    ...cardioMoments(facts),
    ...pepMoments(facts),
    ...checkinMoments(facts, options),
  ]
}
