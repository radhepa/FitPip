import { BODY_COLOR, LEVEL_COLORS, LEVEL_LABELS } from '../config/muscleMap'

const SWATCHES = [BODY_COLOR, ...LEVEL_COLORS]

/** Key for the shading: each colour with the weekly-set range it stands for. */
export function HeatLegend() {
  return (
    <ul className="m-0 flex list-none flex-wrap items-center justify-center gap-x-4 gap-y-2 p-0 text-xs text-[#5c5347]" aria-label="Shading key, sets per week">
      {SWATCHES.map((color, level) => (
        <li key={level} className="flex items-center gap-1.5">
          <span className="size-3.5 rounded-md border border-[var(--color-plate-ink)]" style={{ background: color }} aria-hidden="true" />
          <span>{LEVEL_LABELS[level]}</span>
        </li>
      ))}
    </ul>
  )
}
