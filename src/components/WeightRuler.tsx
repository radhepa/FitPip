import { useMemo, type KeyboardEvent } from 'react'
import { useRulerMotion } from '../hooks/useRulerMotion'

interface Props {
  value: number
  onChange: (value: number) => void
  unit: string
  min?: number
  max?: number
}

const PX_PER_UNIT = 70
const WIDTH = 320
/** Whole units of ticks drawn either side of the window's centre (about 2.3 are visible each side). */
const SPAN = 4
const round1 = (n: number) => Math.round(n * 10) / 10
const FADE = 'linear-gradient(90deg, transparent, #000 18%, #000 82%, transparent)'

/**
 * A ruler you drag or flick sideways to dial in a weight; tap a number to glide to it. Arrow keys work
 * too: ±0.1, with Shift ±1. The motion itself lives in useRulerMotion.
 */
export function WeightRuler({ value, onChange, unit, min = 20, max = 999 }: Props) {
  const { base, groupRef, handlers } = useRulerMotion({ value, onChange, min, max, pxPerUnit: PX_PER_UNIT, width: WIDTH })
  const clamp = (n: number) => Math.min(max, Math.max(min, round1(n)))

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const step = e.shiftKey ? 1 : 0.1
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') onChange(clamp(value + step))
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') onChange(clamp(value - step))
    else return
    e.preventDefault()
  }

  // Ticks every 0.1 (in tenths, so the keys stay stable as the window moves along).
  const ticks = useMemo(() => Array.from({ length: SPAN * 20 + 1 }, (_, i) => (base - SPAN) * 10 + i), [base])
  const nearest = Math.round(value)

  return (
    <div
      role="slider"
      tabIndex={0}
      aria-label={`Weight in ${unit}`}
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={value}
      aria-valuetext={`${value.toFixed(1)} ${unit}`}
      {...handlers}
      onKeyDown={onKeyDown}
      className="relative cursor-grab select-none rounded-2xl bg-bg active:cursor-grabbing"
      style={{ touchAction: 'pan-y', maskImage: FADE, WebkitMaskImage: FADE }}
    >
      <svg viewBox={`0 0 ${WIDTH} 64`} className="block w-full" aria-hidden="true">
        <g ref={groupRef}>
          {ticks.map((tenths) => {
            const x = WIDTH / 2 + (tenths / 10 - base) * PX_PER_UNIT
            const whole = tenths % 10 === 0
            const half = !whole && tenths % 5 === 0
            const outside = tenths < min * 10 || tenths > max * 10
            const current = whole && tenths / 10 === nearest
            return (
              <g key={tenths} opacity={outside ? 0.2 : 1}>
                <line x1={x} x2={x} y1={8} y2={whole ? 36 : half ? 28 : 20} stroke="var(--color-muted)" strokeWidth={whole ? 2 : 1} strokeLinecap="round" opacity={whole ? 0.9 : 0.5} />
                {whole && (
                  <text x={x} y={54} textAnchor="middle" fontSize={current ? 13 : 11} fontWeight={current ? 800 : 700} fill={current ? 'var(--color-text)' : 'var(--color-muted)'} className="ruler-label">
                    {tenths / 10}
                  </text>
                )}
              </g>
            )
          })}
        </g>
        <path d={`M${WIDTH / 2 - 7} 0 L${WIDTH / 2 + 7} 0 L${WIDTH / 2} 9 Z`} fill="var(--color-accent)" />
        <line x1={WIDTH / 2} x2={WIDTH / 2} y1={4} y2={42} stroke="var(--color-accent)" strokeWidth={3} strokeLinecap="round" className="ruler-needle" />
      </svg>
    </div>
  )
}
