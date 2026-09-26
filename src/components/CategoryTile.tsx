import type { CSSProperties } from 'react'
import { CATEGORY_INFO } from '../lib/activity'
import type { Category } from '../types/db'
import { CategoryIcon } from './icons'

interface Props {
  category: Category
  /** Tile edge in rem (default 2.75). */
  size?: number
}

/** A rounded tile with the activity's icon in its colour. */
export function CategoryTile({ category, size = 2.75 }: Props) {
  const style = { '--tint': CATEGORY_INFO[category].color, '--tile': `${size}rem` } as CSSProperties
  return (
    <span className="icon-tile" style={style} aria-hidden="true">
      <CategoryIcon category={category} size={size >= 3 ? 'size-7' : size <= 2.25 ? 'size-4' : 'size-6'} />
    </span>
  )
}

/** Style that sets --tint to a category colour (for pills, chips and tinted cards). */
export const tint = (category: Category): CSSProperties => ({ '--tint': CATEGORY_INFO[category].color }) as CSSProperties
