import { SECTION_INFO, type Section } from '../lib/activity'
import type { Category } from '../types/db'
import { CategoryTile } from './CategoryTile'
import { PlusIcon } from './icons'

const SECTION_ICON: Record<Section, Category> = { strength: 'strength', cardio: 'cardio', mobility: 'yoga' }

interface Props {
  section: Section
  count: number
  onAdd: () => void
}

/** The heading of a workout section (Strength, Cardio, Yoga & stretching) with its own add button. */
export function SectionHeader({ section, count, onAdd }: Props) {
  const info = SECTION_INFO[section]
  return (
    <div className="mt-6 mb-3 flex items-center gap-3">
      <CategoryTile category={SECTION_ICON[section]} size={2.25} />
      <div className="min-w-0 flex-1">
        <h2 className="font-display text-xl leading-tight font-extrabold">
          {info.title} {count > 0 && <span className="text-muted">· {count}</span>}
        </h2>
        <p className="text-xs font-semibold text-muted">{info.hint}</p>
      </div>
      <button type="button" onClick={onAdd} className="app-button button-secondary button-sm" aria-label={`Add to ${info.title}`}>
        <PlusIcon size="size-4" /> Add
      </button>
    </div>
  )
}
