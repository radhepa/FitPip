import type { CSSProperties } from 'react'
import { CATEGORY_INFO } from '../lib/activity'
import type { Category } from '../types/db'
import { CategoryTile } from './CategoryTile'
import { PlusIcon } from './icons'

const QUICK: Category[] = ['strength', 'cardio', 'swim', 'yoga', 'stretch', 'combat']

interface Props {
  busy: boolean
  /** Start a workout and pick exercises of this kind (or anything, when null). */
  onStart: (category: Category | null) => void
}

/** A grid of big buttons to start any kind of workout right now. */
export function QuickStart({ busy, onStart }: Props) {
  return (
    <div className="stagger grid grid-cols-3 gap-2.5">
      {QUICK.map((category, i) => (
        <button
          key={category}
          type="button"
          disabled={busy}
          onClick={() => onStart(category)}
          className="card pressable flex cursor-pointer flex-col items-center gap-2 px-2 py-3.5 disabled:opacity-50"
          style={{ '--i': i } as CSSProperties}
        >
          <CategoryTile category={category} />
          <span className="text-sm font-extrabold">{CATEGORY_INFO[category].short}</span>
        </button>
      ))}
      <button
        type="button"
        disabled={busy}
        onClick={() => onStart(null)}
        className="card pressable col-span-3 flex min-h-12 cursor-pointer items-center justify-center gap-2 text-sm font-extrabold text-muted disabled:opacity-50"
        style={{ '--i': QUICK.length } as CSSProperties}
      >
        <PlusIcon size="size-4" /> Mix and match
      </button>
    </div>
  )
}
