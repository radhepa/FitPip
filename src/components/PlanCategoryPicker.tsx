import { CATEGORY_ORDER } from '../lib/activity'
import { categoryName } from '../lib/weekPlan'
import type { Category } from '../types/db'
import { tint } from './CategoryTile'
import { CategoryIcon } from './icons'

interface Props {
  selected: Set<Category>
  /** Already on the day: shown ticked, not selectable. */
  added: Set<Category>
  onToggle: (category: Category) => void
}

/** Plan a day by kind of workout (Weightlifting, Cardio, Yoga, Stretching...). The exercises are picked when it is started. */
export function PlanCategoryPicker({ selected, added, onToggle }: Props) {
  return (
    <div className="mb-4 border-b border-line pb-4">
      <p className="mb-2 text-sm font-bold">Kind of workout</p>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Kind of workout">
        {CATEGORY_ORDER.map((category) => {
          const isAdded = added.has(category)
          return (
            <button
              key={category}
              type="button"
              className="filter-chip disabled:opacity-60"
              style={tint(category)}
              aria-pressed={isAdded || selected.has(category)}
              disabled={isAdded}
              onClick={() => onToggle(category)}
            >
              <CategoryIcon category={category} size="size-4" />
              {categoryName(category)}
              {isAdded && <span className="sr-only"> (already on this day)</span>}
            </button>
          )
        })}
      </div>
      <p className="mt-2 text-sm text-muted">Say what kind of workout the day is. You choose the exercises when you start it.</p>
    </div>
  )
}
