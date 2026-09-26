import type { CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { CATEGORY_INFO } from '../lib/activity'
import type { Category, Exercise, TemplateWithItems } from '../types/db'
import { CategoryTile } from './CategoryTile'
import { ChevronIcon } from './icons'

interface Props {
  item: TemplateWithItems
  exerciseById: Map<string, Exercise>
  index?: number
}

/** A routine in the list: its name, a colour bar of what it contains, and a peek at the first few. */
export function TemplateListItem({ item, exerciseById, index = 0 }: Props) {
  const { template, items } = item
  const exercises = items.map((i) => exerciseById.get(i.exercise_id)).filter(Boolean) as Exercise[]
  const names = exercises.map((e) => e.name)
  const preview = names.length > 3 ? `${names.slice(0, 3).join(', ')} +${names.length - 3}` : names.join(', ')
  const counts = new Map<Category, number>()
  exercises.forEach((e) => counts.set(e.category, (counts.get(e.category) ?? 0) + 1))
  const main = [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'strength'

  return (
    <Link to={`/plan/templates/${template.id}`} className="card pressable block p-3.5" style={{ '--i': index } as CSSProperties}>
      <div className="flex items-center gap-3">
        <CategoryTile category={main} />
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-3">
            <span className="truncate font-extrabold">{template.name}</span>
            <span className="shrink-0 text-xs font-semibold text-muted">
              {items.length} {items.length === 1 ? 'exercise' : 'exercises'}
            </span>
          </div>
          <p className="truncate text-sm text-muted">{preview || 'Lift name · exercises optional'}</p>
        </div>
        <span className="text-muted" aria-hidden="true">
          <ChevronIcon size="size-5" />
        </span>
      </div>
      {exercises.length > 0 && (
        <div className="mt-3 flex h-1.5 overflow-hidden rounded-full" aria-hidden="true">
          {[...counts.entries()].map(([category, count]) => (
            <span key={category} style={{ flex: count, background: CATEGORY_INFO[category].color }} />
          ))}
        </div>
      )}
    </Link>
  )
}
