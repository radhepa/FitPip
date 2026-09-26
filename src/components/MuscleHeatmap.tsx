import Model, { type IMuscleStats } from 'react-body-highlighter'
import { useCallback, useMemo } from 'react'
import { BODY_COLOR, LEVEL_COLORS, type BodyMuscle } from '../config/muscleMap'
import { toModelData, type Level } from '../lib/muscleVolume'

interface Props {
  levels: Partial<Record<BodyMuscle, Level>>
  /** Called with the region that was tapped (head, neck and knees included; the caller ignores them). */
  onSelect: (region: BodyMuscle) => void
}

const VIEWS = [
  { type: 'anterior', label: 'Front' },
  { type: 'posterior', label: 'Back' },
] as const

/** Front and back figures side by side, each region shaded from light to dark red by its level. */
export function MuscleHeatmap({ levels, onSelect }: Props) {
  const data = useMemo(() => toModelData(levels), [levels])
  const colors = useMemo(() => [...LEVEL_COLORS], [])
  const handleClick = useCallback(({ muscle }: IMuscleStats) => onSelect(muscle), [onSelect])

  return (
    <div className="grid grid-cols-1 gap-3 min-[360px]:grid-cols-2">
      {VIEWS.map(({ type, label }) => (
        <figure key={type} className="m-0 text-center">
          <div role="img" aria-label={`${label} view of the body with muscles shaded by weekly sets`}>
            <Model
              type={type}
              data={data}
              bodyColor={BODY_COLOR}
              highlightedColors={colors}
              onClick={handleClick}
              style={{ width: '100%', maxWidth: '11rem', margin: '0 auto' }}
            />
          </div>
          <figcaption className="mt-1 text-xs font-bold text-plate-ink">{label}</figcaption>
        </figure>
      ))}
    </div>
  )
}
