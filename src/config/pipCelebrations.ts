import type { PipCelebrationReaction } from '../components/pip/types'

export interface PipCelebration {
  id: PipCelebrationReaction
  name: string
  title: string
  message: readonly [string, string]
  praise: string
  accent: string
  effect: 'confetti' | 'high-five' | 'music' | 'stars' | 'hearts'
  burstAt: number
  praiseAt: number
}

export const PIP_CELEBRATIONS: readonly PipCelebration[] = [
  {
    id: 'celebrate', name: 'Victory jump', title: 'You did it!',
    message: ['You showed up. You put in the work.', 'That deserves a little happy dance.'],
    praise: 'So proud of you!', accent: '#8ecbff', effect: 'confetti', burstAt: 740, praiseAt: 1850,
  },
  {
    id: 'high-five', name: 'High five', title: 'High five!',
    message: ['One workout in the books.', 'One very proud little panda.'],
    praise: 'Put it here!', accent: '#ffe2a0', effect: 'high-five', burstAt: 1050, praiseAt: 1400,
  },
  {
    id: 'victory-dance', name: 'Victory dance', title: 'You earned this!',
    message: ['You did the hard part.', 'Pip will handle the victory dance.'],
    praise: 'That’s your victory dance!', accent: '#c5b1ff', effect: 'music', burstAt: 600, praiseAt: 1800,
  },
  {
    id: 'strong-finish', name: 'Strong finish', title: 'Look at you go!',
    message: ['Every bit of effort counts.', 'Take a moment. You earned it.'],
    praise: 'Big effort. Tiny flex.', accent: '#83e5ce', effect: 'stars', burstAt: 1150, praiseAt: 1750,
  },
  {
    id: 'heart-hug', name: 'Panda hug', title: 'Proud of you!',
    message: ['You made time for yourself.', 'Sending a little panda love.'],
    praise: 'One big panda hug!', accent: '#ffacca', effect: 'hearts', burstAt: 1250, praiseAt: 1950,
  },
]
