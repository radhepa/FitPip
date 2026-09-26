import type { CSSProperties } from 'react'

interface ChipProps {
  label: string
  selected?: boolean
  onClick?: () => void
  /** A colour for the selected state (defaults to the accent). */
  color?: string
}

/** Small pill; a toggle button when `onClick` is given, plain text otherwise. */
export function Chip({ label, selected = false, onClick, color }: ChipProps) {
  const style = (color ? { '--tint': color } : undefined) as CSSProperties | undefined
  if (!onClick) {
    return (
      <span className={selected ? 'pill' : 'pill !bg-surface-2 !text-muted'} style={style}>
        {label}
      </span>
    )
  }
  return (
    <button type="button" aria-pressed={selected} onClick={onClick} className="filter-chip" style={style}>
      {label}
    </button>
  )
}
