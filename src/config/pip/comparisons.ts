/** Things with a known weight, for "you have lifted about N of these" lines. Weights are in pounds. */
export interface WeightComparison {
  lb: number
  /** With its article, for a single one: "a pickup truck". */
  one: string
  /** Plural, for two or more: "pickup trucks". */
  many: string
}

/** Smallest first. */
export const WEIGHT_COMPARISONS: readonly WeightComparison[] = [
  { lb: 1000, one: 'a grand piano', many: 'grand pianos' },
  { lb: 3000, one: 'a small car', many: 'small cars' },
  { lb: 5000, one: 'a pickup truck', many: 'pickup trucks' },
  { lb: 12000, one: 'an elephant', many: 'elephants' },
  { lb: 80000, one: 'a fully loaded semi truck', many: 'fully loaded semi trucks' },
  { lb: 300000, one: 'a blue whale', many: 'blue whales' },
  { lb: 450000, one: 'the Statue of Liberty', many: 'Statues of Liberty' },
]

/** Barbell weights that mean something to a lifter, in pounds and kilograms. */
export const PLATE_MILESTONES: Record<'lb' | 'kg', readonly number[]> = {
  lb: [135, 185, 225, 275, 315, 365, 405, 495],
  kg: [60, 80, 100, 120, 140, 160, 180, 200],
}

/** How many 45 lb plates a side that is, when it is a whole number of them. */
export const PLATES_A_SIDE: Record<number, string> = {
  135: 'one plate a side',
  225: 'two plates a side',
  315: 'three plates a side',
  405: 'four plates a side',
  495: 'five plates a side',
}

/** Multiples of bodyweight worth a mention, by strength standard key. */
export const BODYWEIGHT_MULTIPLES: Record<string, readonly number[]> = {
  bench: [0.75, 1, 1.25, 1.5],
  squat: [1, 1.25, 1.5, 2],
  deadlift: [1.25, 1.5, 2, 2.5],
  overhead_press: [0.5, 0.75, 1],
}

/** Workout counts that get a line of their own. */
export const WORKOUT_MILESTONES: readonly number[] = [1, 5, 10, 15, 20, 25, 30, 40, 50, 60, 75, 100, 125, 150, 200, 250, 300, 400, 500]
