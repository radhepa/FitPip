import { useRef, type KeyboardEvent, type PointerEvent } from 'react'
import { buzz } from './fx'

interface Props {
  value: number
  onChange: (value: number) => void
  unit: string
  min?: number
  max?: number
}

const PX_PER_TENTH = 7
const WIDTH = 320
const round1 = (n: number) => Math.round(n * 10) / 10

/** A ruler you drag sideways to dial in a weight (arrow keys work too: ±0.1, with Shift ±1). */
export function WeightRuler({ value, onChange, unit, min = 20, max = 999 }: Props) {
  const drag = useRef<{ x: number; value: number; last: number } | null>(null)
  const clamp = (n: number) => Math.min(max, Math.max(min, round1(n)))

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    drag.current = { x: e.clientX, value, last: value }
  }
  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!drag.current) return
    const scale = WIDTH / e.currentTarget.getBoundingClientRect().width
    const next = clamp(drag.current.value - ((e.clientX - drag.current.x) * scale) / PX_PER_TENTH / 10)
    if (next !== drag.current.last) {
      if (Math.floor(next) !== Math.floor(drag.current.last)) buzz(4)
      drag.current.last = next
      onChange(next)
    }
  }
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const step = e.shiftKey ? 1 : 0.1
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') onChange(clamp(value + step))
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') onChange(clamp(value - step))
    else return
    e.preventDefault()
  }

  // Ticks every 0.1 around the current value; a long tick and a number every whole unit.
  const first = Math.floor((value - WIDTH / 2 / PX_PER_TENTH / 10) * 10)
  const ticks = Array.from({ length: Math.ceil(WIDTH / PX_PER_TENTH) + 2 }, (_, i) => (first + i) / 10)

  return (
    <div
      role="slider"
      tabIndex={0}
      aria-label={`Weight in ${unit}`}
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={value}
      aria-valuetext={`${value.toFixed(1)} ${unit}`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={() => (drag.current = null)}
      onPointerCancel={() => (drag.current = null)}
      onKeyDown={onKeyDown}
      className="relative cursor-grab touch-none select-none rounded-2xl bg-bg active:cursor-grabbing"
      style={{ maskImage: 'linear-gradient(90deg, transparent, #000 18%, #000 82%, transparent)', WebkitMaskImage: 'linear-gradient(90deg, transparent, #000 18%, #000 82%, transparent)' }}
    >
      <svg viewBox={`0 0 ${WIDTH} 64`} className="block w-full" aria-hidden="true">
        {ticks.map((t) => {
          const x = WIDTH / 2 + (t - value) * 10 * PX_PER_TENTH
          const whole = Math.abs(t - Math.round(t)) < 0.001
          const half = !whole && Math.abs(t * 2 - Math.round(t * 2)) < 0.001
          return (
            <g key={t.toFixed(1)}>
              <line x1={x} x2={x} y1={8} y2={whole ? 36 : half ? 28 : 20} stroke="var(--color-muted)" strokeWidth={whole ? 2 : 1} strokeLinecap="round" opacity={whole ? 0.9 : 0.5} />
              {whole && (
                <text x={x} y={54} textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--color-muted)">
                  {Math.round(t)}
                </text>
              )}
            </g>
          )
        })}
        <path d={`M${WIDTH / 2 - 7} 0 L${WIDTH / 2 + 7} 0 L${WIDTH / 2} 9 Z`} fill="var(--color-accent)" />
        <line x1={WIDTH / 2} x2={WIDTH / 2} y1={4} y2={42} stroke="var(--color-accent)" strokeWidth={3} strokeLinecap="round" />
      </svg>
    </div>
  )
}
