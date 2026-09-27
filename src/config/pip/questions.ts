/**
 * Questions Pip sometimes asks on the Today card, with quick replies. Pip asks at most one a day,
 * and only on a day with something to do. The replies can mention {hint}, which becomes what you
 * did last time on the first lift in today's plan ("Last time on Bench Press: 155 × 5, a week ago.
 * Beat it by one rep."), or nothing when there is no history yet.
 */
import type { PipMood } from '../../components/pip/types'

export interface QuestionChoiceTemplate {
  label: string
  mood: PipMood
  replies: readonly string[]
}

export interface QuestionTemplate {
  id: string
  prompts: readonly string[]
  choices: readonly QuestionChoiceTemplate[]
}

export const ENERGY_QUESTION: QuestionTemplate = {
  id: 'energy',
  prompts: ["Quick check: how's your energy today?", "Before we start: how's the tank?", '{name}, how are you feeling today?'],
  choices: [
    {
      label: 'Full tank',
      mood: 'flex',
      replies: ["Then today is a day to chase a record. {hint}", 'Love it. Use it well. {hint}'],
    },
    {
      label: 'Okay',
      mood: 'nod',
      replies: ['Steady is a win. Match last time, and add a rep if it feels easy. {hint}', 'Okay is plenty. Do the plan and go home happy. {hint}'],
    },
    {
      label: 'Running low',
      mood: 'love',
      replies: [
        'Then keep it short: warm up, your first two lifts, done. Showing up counts.',
        'Low battery? Lighter weights, same routine. The habit matters more than the numbers today.',
      ],
    },
  ],
}

export const SLEEP_QUESTION: QuestionTemplate = {
  id: 'sleep',
  prompts: ['How did you sleep last night?', '{name}, how was the sleep?'],
  choices: [
    {
      label: 'Great',
      mood: 'bounce',
      replies: ['Sleep is free gains. Bank it again tonight. {hint}', 'Well rested lifts better. Go get it. {hint}'],
    },
    {
      label: 'Meh',
      mood: 'nod',
      replies: ['Warm up a little longer today. Muscles wake up slowly. {hint}', 'Fine. Keep the plan, but leave one extra rep in the tank.'],
    },
    {
      label: 'Rough',
      mood: 'yawn',
      replies: ['Rough night? Lower the intensity, keep the habit, and get to bed early tonight.', 'Then go easy today and protect tonight. Sleep is the training now.'],
    },
  ],
}

export const QUESTIONS: readonly QuestionTemplate[] = [ENERGY_QUESTION, SLEEP_QUESTION]
