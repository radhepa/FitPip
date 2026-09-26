const round1 = (n: number) => Math.round(n * 10) / 10

/** Epley estimated one-rep max. A single rep is its own 1RM. */
export function estimate1RM(weight: number, reps: number): number {
  if (reps < 1 || weight <= 0) return 0
  if (reps === 1) return round1(weight)
  return round1(weight * (1 + reps / 30))
}
