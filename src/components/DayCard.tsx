import type { CSSProperties } from 'react'
import { CATEGORY_INFO } from '../lib/activity'
import { entryCategories, entryMinutes, entryName, WEEKDAY_NAMES, type PlanEntry } from '../lib/weekPlan'
import type { Exercise } from '../types/db'
import { CategoryIcon, CopyIcon, MoonIcon, PlusIcon } from './icons'

interface Props {
  weekday: number
  entries: PlanEntry[]
  exerciseById: Map<string, Exercise>
  isToday: boolean
  index: number
  onAdd: () => void
  onOpenEntry: (entry: PlanEntry) => void
  onCopy: () => void
}

/** One day of the week: everything planned on it as coloured chips, plus add and copy. */
export function DayCard({ weekday, entries, exerciseById, isToday, index, onAdd, onOpenEntry, onCopy }: Props) {
  const minutes = entries.reduce((total, e) => total + entryMinutes(e, exerciseById), 0)
  const accent = entries.length > 0 ? CATEGORY_INFO[entryCategories(entries[0], exerciseById)[0]].color : 'var(--color-line-strong)'

  return (
    <li
      className={`card overflow-hidden ${isToday ? 'ring-2 ring-accent/60' : ''}`}
      style={{ '--i': index } as CSSProperties}
      aria-label={WEEKDAY_NAMES[weekday]}
    >
      <div className="absolute inset-y-0 left-0 w-1.5" style={{ background: accent }} aria-hidden="true" />
      <div className="py-3 pr-3 pl-4.5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-baseline gap-2">
            <h3 className="font-display text-lg font-extrabold">{WEEKDAY_NAMES[weekday]}</h3>
            {isToday && <span className="pill">Today</span>}
            <span className="truncate text-xs font-semibold text-muted">
              {entries.length === 0 ? 'Rest day' : `${entries.length} ${entries.length === 1 ? 'thing' : 'things'}${minutes > 0 ? ` · ~${minutes} min` : ''}`}
            </span>
          </div>
          {entries.length > 0 && (
            <button type="button" onClick={onCopy} className="icon-button !size-9" aria-label={`Copy ${WEEKDAY_NAMES[weekday]} to other days`}>
              <CopyIcon size="size-4" />
            </button>
          )}
        </div>

        <div className="mt-2.5 flex flex-wrap gap-2">
          {entries.length === 0 && (
            <span className="inline-flex min-h-10 items-center gap-1.5 rounded-full bg-surface-2 px-3 text-sm font-semibold text-muted">
              <MoonIcon size="size-4" /> Rest
            </span>
          )}
          {entries.map((entry) => {
            const category = entryCategories(entry, exerciseById)[0]
            return (
              <button
                key={entry.item.id}
                type="button"
                onClick={() => onOpenEntry(entry)}
                className="pressable inline-flex min-h-10 max-w-full cursor-pointer items-center gap-1.5 rounded-full border px-3 text-sm font-bold"
                style={{
                  borderColor: `color-mix(in srgb, ${CATEGORY_INFO[category].color} 45%, transparent)`,
                  background: `color-mix(in srgb, ${CATEGORY_INFO[category].color} 14%, transparent)`,
                  color: 'var(--color-text)',
                }}
              >
                <span style={{ color: CATEGORY_INFO[category].color }}>
                  <CategoryIcon category={category} size="size-4" />
                </span>
                <span className="truncate">{entryName(entry)}</span>
              </button>
            )
          })}
          <button
            type="button"
            onClick={onAdd}
            className="pressable inline-flex min-h-10 cursor-pointer items-center gap-1 rounded-full border border-dashed border-line-strong px-3 text-sm font-bold text-muted"
            aria-label={`Add to ${WEEKDAY_NAMES[weekday]}`}
          >
            <PlusIcon size="size-4" /> Add
          </button>
        </div>
      </div>
    </li>
  )
}
