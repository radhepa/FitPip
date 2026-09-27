// A few warm-up and cool-down holds for lifters (the yoga and stretch bank already covers the rest).
import { activity, type CatalogEntry } from './entry.ts'

const hold = activity('stretch', 'time', 'bodyweight')

export const LIFTER_MOBILITY: CatalogEntry[] = [
  hold('Couch Stretch', ['quads'], ['glutes'], [
    'Kneel with your back shin up against a wall or bench and your other foot forward.',
    'Squeeze your glute and lift your chest until you feel the front of your thigh. Log each side.',
  ]),
  hold('90/90 Hip Stretch', ['glutes', 'abductors'], ['adductors'], [
    'Sit with both knees bent at 90 degrees, one leg in front and one to the side.',
    'Sit tall and lean gently over your front shin. Log each side.',
  ]),
  hold('Deep Squat Hold', ['adductors', 'glutes'], ['quads', 'calves'], [
    'Sink into a deep squat with your feet a little wider than your hips.',
    'Press your elbows into your knees and keep your chest up.',
  ]),
  activity('stretch', 'time', 'other')('Thoracic Extension (Foam Roller)', ['upper_back'], ['lats'], [
    'Lie with a foam roller under your upper back and your hands behind your head.',
    'Gently arch back over the roller and breathe. Move it up or down a few inches between holds.',
  ]),
  hold('Ankle Mobility (Wall Drill)', ['calves'], [], [
    'Face a wall with one foot a few inches away and drive your knee forward over your toes.',
    'Keep your heel down and hold. Log each side.',
  ]),
]
