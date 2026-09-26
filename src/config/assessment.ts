export const ASSESSMENT_EXERCISES = [
  { key: 'push_up', name: 'Push-ups', kind: 'reps', hint: 'Your most full push-ups in one continuous set, at bodyweight.' },
  { key: 'bench', name: 'Bench press', kind: 'load', hint: 'Flat barbell bench press. Count the bar and plates together.' },
  { key: 'squat', name: 'Back squat', kind: 'load', hint: 'Barbell back squat. Count the bar and plates together.' },
  { key: 'deadlift', name: 'Deadlift', kind: 'load', hint: 'Conventional barbell deadlift. Count the bar and plates together.' },
  { key: 'pull_up', name: 'Pull-ups', kind: 'reps', hint: 'Your most unassisted pull-ups in one continuous set, at bodyweight.' },
] as const

export type AssessmentExerciseKey = (typeof ASSESSMENT_EXERCISES)[number]['key']
