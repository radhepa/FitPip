/**
 * True when two values read from the database hold exactly the same data: plain objects and arrays
 * are compared field by field, everything else (Maps, Dates, class instances, functions) only by
 * identity, so an answer of `true` is always safe to act on.
 *
 * Used to keep the previous result when a quiet re-read brings back what is already on screen, so the
 * screen and everything worked out from it (ranks, Pip's facts) are not built again for nothing.
 */
export function sameData(a: unknown, b: unknown): boolean {
  if (Object.is(a, b)) return true
  if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) return false
  if (Array.isArray(a)) {
    if (!Array.isArray(b) || a.length !== b.length) return false
    for (let i = 0; i < a.length; i++) if (!sameData(a[i], b[i])) return false
    return true
  }
  if (Array.isArray(b) || !isPlain(a) || !isPlain(b)) return false
  const keysA = Object.keys(a)
  if (keysA.length !== Object.keys(b).length) return false
  for (const key of keysA) {
    if (!Object.prototype.hasOwnProperty.call(b, key)) return false
    if (!sameData((a as Record<string, unknown>)[key], (b as Record<string, unknown>)[key])) return false
  }
  return true
}

function isPlain(value: object): boolean {
  const proto = Object.getPrototypeOf(value)
  return proto === Object.prototype || proto === null
}
