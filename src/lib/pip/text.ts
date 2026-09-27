// Filling in Pip's templates and choosing between wordings.

/** Replaces {slot} with its value. A slot that was not given is a bug in the template, so it throws. */
export function fill(template: string, slots: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => {
    if (!(key in slots)) throw new Error(`Pip template needs {${key}}: ${template}`)
    return String(slots[key])
  })
}

export const capitalize = (text: string): string => text.charAt(0).toUpperCase() + text.slice(1)

export const plural = (count: number, one: string, many = `${one}s`): string => (count === 1 ? one : many)

/** A stable 32-bit hash, so the same seed always makes the same choice. */
export function hash(text: string): number {
  let h = 2166136261
  for (let i = 0; i < text.length; i += 1) {
    h ^= text.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

/** The same wording for the same seed (an id and a date), so a line does not change between renders. */
export function pickVariant<T>(variants: readonly T[], seed: string): T {
  if (variants.length === 0) throw new Error('No wordings to choose from.')
  return variants[hash(seed) % variants.length]
}

/** "1 lb" style rounding for numbers Pip quotes: no trailing .0, at most one decimal. */
export function tidy(n: number, places = 1): string {
  const rounded = Math.round(n * 10 ** places) / 10 ** places
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(places)
}
