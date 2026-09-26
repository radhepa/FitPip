import Model, { type IMuscleStats } from 'react-body-highlighter'
import { useCallback, useMemo } from 'react'
import { BODY_COLOR, LEVEL_COLORS, type BodyMuscle } from '../config/muscleMap'
import { toModelData } from '../lib/muscleVolume'

interface Props {
  /** Level of each region, from 1 (colours[0]) up. Regions left out are drawn plain. */
  levels: Partial<Record<BodyMuscle, number>>
  /** One colour per level; defaults to the weekly-sets shading. */
  colors?: readonly string[]
  bodyColor?: string
  /** What the shading means, for screen readers ("muscles shaded by weekly sets"). */
  label?: string
  /** Called with the region that was tapped (head, neck and knees included; the caller ignores them). */
  onSelect: (region: BodyMuscle) => void
}

const VIEWS = [
  { type: 'anterior', label: 'Front' },
  { type: 'posterior', label: 'Back' },
] as const

/** Front and back figures side by side, each region shaded by its level. */
export function MuscleHeatmap({ levels, colors = LEVEL_COLORS, bodyColor = BODY_COLOR, label = 'muscles shaded by weekly sets', onSelect }: Props) {
  const data = useMemo(() => toModelData(levels), [levels])
  const highlighted = useMemo(() => [...colors], [colors])
  const handleClick = useCallback(({ muscle }: IMuscleStats) => onSelect(muscle), [onSelect])

  return (
    <div className="grid grid-cols-1 gap-3 min-[360px]:grid-cols-2">
      {VIEWS.map(({ type, label: view }) => (
        <figure key={type} className="m-0 text-center">
          <div role="img" aria-label={`${view} view of the body with ${label}`}>
            <Model
              type={type}
              data={data}
              bodyColor={bodyColor}
              highlightedColors={highlighted}
              onClick={handleClick}
              style={{ width: '100%', maxWidth: '11rem', margin: '0 auto' }}
            />
          </div>
          <figcaption className="mt-1 text-xs font-bold text-plate-ink">{view}</figcaption>
        </figure>
      ))}
    </div>
  )
}
