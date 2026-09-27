import type { PipMood } from '../../components/pip/types'

/** What a moment is about (used to give the right kind of line to the right kind of day). */
export type PipTopic = 'greeting' | 'plan' | 'habit' | 'lift' | 'cardio' | 'weight' | 'goal' | 'checkin'

/** The three things you can ask Pip for on the Today card. */
export type PipTalk = 'progress' | 'throwback' | 'pep'

/** One quick reply to a question Pip asks, with what he says back and what he does while saying it. */
export interface PipChoice {
  label: string
  reply: string
  mood: PipMood
}

/** One thing Pip can say, and the gesture he makes while saying it. */
export interface PipMoment {
  /** Stable, so a moment that was just said is not said again straight away. */
  id: string
  text: string
  /** The gesture or brief pose while he says it; null leaves the page's pose alone. */
  mood: PipMood | null
  topic: PipTopic
  /** Higher is said sooner. */
  priority: number
  /** Hours before the same moment may be said again. */
  cooldownHours: number
  /** Which "ask Pip" chip can bring it up. */
  talk?: PipTalk
  /** The day (YYYY-MM-DD) the thing it is about happened, when it is about one event. */
  on?: string
  /** Makes it a question: `text` is what he asks and these are the quick replies. */
  choices?: PipChoice[]
}
