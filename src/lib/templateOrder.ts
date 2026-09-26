import type { TemplateExercise } from '../types/db'

const byPosition = (a: TemplateExercise, b: TemplateExercise) =>
  a.position - b.position || a.created_at.localeCompare(b.created_at)

/** Position for a new exercise added at the end. */
export const nextPosition = (items: TemplateExercise[]): number =>
  items.reduce((max, i) => Math.max(max, i.position), -1) + 1

/**
 * Moves one exercise up (-1) or down (+1). Returns only the rows whose position changes
 * (positions are re-numbered 0..n-1, which also tidies gaps left by removals).
 */
export function moveItem(items: TemplateExercise[], id: string, direction: -1 | 1): { id: string; position: number }[] {
  const ordered = [...items].sort(byPosition)
  const from = ordered.findIndex((i) => i.id === id)
  const to = from + direction
  if (from < 0 || to < 0 || to >= ordered.length) return []
  const moved = ordered[from]
  ordered[from] = ordered[to]
  ordered[to] = moved
  return ordered.flatMap((item, index) => (item.position === index ? [] : [{ id: item.id, position: index }]))
}
