// How much XP each thing earns. XP is worked out from your logged history every time (never
// stored), so changing a number here re-scores everything, including past workouts.

export const XP_RULES = {
  /** Each lifting set (weight x reps, bodyweight reps too). */
  liftSet: 10,
  /** Each timed hold or round, before its minutes are added. */
  timedSetBase: 3,
  /** Every minute of a timed or distance activity. */
  perActiveMinute: 3,
  /** Every kilometre of a distance logged without a time (swims earn 4x per km). */
  perKmWithoutTime: 10,
  /** No single set earns more than this (a three-hour hike is still 540). */
  maxPerSet: 600,
  /** Finishing a workout. */
  finishedWorkout: 25,
  /** Beating your best on an exercise (once per exercise per workout). */
  personalRecord: 50,
  /** Doing an exercise for the first time. */
  firstTime: 20,
} as const

/**
 * XP needed to reach a level: 50 x level x (level - 1). Level 2 at 100 XP, 5 at 1,000, 10 at
 * 4,500, 20 at 19,000. Levels have no cap.
 */
export const XP_LEVEL_STEP = 50
