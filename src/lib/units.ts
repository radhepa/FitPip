import type { Category, DistanceUnit, WeightUnit } from '../types/db'

/** Units a distance can be shown or typed in. Swims use pool units (metres or yards). */
export type LengthUnit = 'km' | 'mi' | 'm' | 'yd'

const METRES: Record<LengthUnit, number> = { km: 1000, mi: 1609.344, m: 1, yd: 0.9144 }

/** The unit to show a distance in for this activity: miles/km, or yards/metres for swimming. */
export function lengthUnitFor(category: Category, unit: DistanceUnit): LengthUnit {
  if (category === 'swim') return unit === 'km' ? 'm' : 'yd'
  return unit
}

export const toMetres = (value: number, unit: LengthUnit): number => Math.round(value * METRES[unit] * 100) / 100

export const fromMetres = (metres: number, unit: LengthUnit): number => metres / METRES[unit]

const trim = (n: number, places: number) => String(Math.round(n * 10 ** places) / 10 ** places)

/** A distance for editing: "5.02", "1500". */
export function distanceInput(metres: number, unit: LengthUnit): string {
  const value = fromMetres(metres, unit)
  return unit === 'm' || unit === 'yd' ? String(Math.round(value)) : trim(value, 2)
}

const wholeNumbers = new Intl.NumberFormat()

/** "5.02 km", "3.1 mi", "1,500 m", "800 yd". */
export function formatDistance(metres: number, unit: LengthUnit): string {
  const value = fromMetres(metres, unit)
  if (unit === 'm' || unit === 'yd') return `${wholeNumbers.format(Math.round(value))} ${unit}`
  return `${trim(value, value >= 100 ? 0 : 2)} ${unit}`
}

/**
 * Pace for a continuous effort: time per mile / km, or per 100 m / 100 yd in the pool.
 * Null when either side is missing.
 */
export function formatPace(seconds: number | null, metres: number | null, unit: LengthUnit): string | null {
  if (!seconds || !metres) return null
  const per = unit === 'm' || unit === 'yd' ? 100 : 1
  const secondsPer = seconds / (fromMetres(metres, unit) / per)
  if (!Number.isFinite(secondsPer) || secondsPer <= 0 || secondsPer > 24 * 3600) return null
  const whole = Math.round(secondsPer)
  const label = per === 100 ? `/100 ${unit}` : `/${unit}`
  return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, '0')} ${label}`
}

const KG_PER_LB = 0.45359237

/** Converts a body weight between units, rounded to one decimal place. */
export function convertWeight(value: number, from: WeightUnit, to: WeightUnit): number {
  if (from === to) return value
  const converted = from === 'lb' ? value * KG_PER_LB : value / KG_PER_LB
  return Math.round(converted * 10) / 10
}
