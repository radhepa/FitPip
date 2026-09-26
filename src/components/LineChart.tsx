import { useState } from 'react'
import { formatShortDate, formatWeight } from '../lib/format'

export interface ChartPoint {
  /** Timestamp in ms. */
  x: number
  y: number
}

const W = 320
const H = 180
const LEFT = 40
const RIGHT = 12
const TOP = 12
const BOTTOM = 26

/** Small dependency-free line chart. Tap a point to read its value. */
export function LineChart({ points, unit, goal, color = 'var(--color-accent)' }: { points: ChartPoint[]; unit: string; goal?: number | null; color?: string }) {
  const [selected, setSelected] = useState<number | null>(null)
  if (points.length === 0) return null

  const xs = points.map((p) => p.x)
  const ys = [...points.map((p) => p.y), ...(goal ? [goal] : [])]
  const xMin = Math.min(...xs)
  const xMax = Math.max(...xs)
  const rawMin = Math.min(...ys)
  const rawMax = Math.max(...ys)
  const pad = rawMax === rawMin ? Math.max(rawMax * 0.1, 1) : (rawMax - rawMin) * 0.15
  const yMin = Math.max(0, rawMin - pad)
  const yMax = rawMax + pad

  const sx = (x: number) =>
    xMax === xMin ? (LEFT + W - RIGHT) / 2 : LEFT + ((x - xMin) / (xMax - xMin)) * (W - LEFT - RIGHT)
  const sy = (y: number) => TOP + (1 - (y - yMin) / (yMax - yMin)) * (H - TOP - BOTTOM)

  const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${sx(p.x).toFixed(1)},${sy(p.y).toFixed(1)}`).join(' ')
  const active = points[Math.min(selected ?? points.length - 1, points.length - 1)]
  const ticks = [yMin, (yMin + yMax) / 2, yMax]

  return (
    <div className="card p-4">
      <p className="mb-1 text-sm text-muted">
        {formatShortDate(active.x)} · <span className="font-extrabold text-text">{formatWeight(active.y)} {unit}</span>
      </p>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Progress chart">
        {ticks.map((t, i) => (
          <g key={i}>
            <line x1={LEFT} x2={W - RIGHT} y1={sy(t)} y2={sy(t)} stroke="var(--color-line)" strokeWidth="0.5" />
            <text x={LEFT - 6} y={sy(t) + 4} textAnchor="end" fontSize="10" fill="var(--color-muted)">
              {Math.round(t)}
            </text>
          </g>
        ))}
        <text x={LEFT} y={H - 6} fontSize="10" fill="var(--color-muted)">
          {formatShortDate(xMin)}
        </text>
        {xMax !== xMin && (
          <text x={W - RIGHT} y={H - 6} textAnchor="end" fontSize="10" fill="var(--color-muted)">
            {formatShortDate(xMax)}
          </text>
        )}
        <defs>
          <linearGradient id="chart-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" style={{ stopColor: color, stopOpacity: 0.28 }} />
            <stop offset="1" style={{ stopColor: color, stopOpacity: 0 }} />
          </linearGradient>
        </defs>
        {goal ? (
          <g>
            <line x1={LEFT} x2={W - RIGHT} y1={sy(goal)} y2={sy(goal)} stroke="var(--color-target)" strokeWidth="1.5" strokeDasharray="5 4" />
            <text x={W - RIGHT} y={sy(goal) - 4} textAnchor="end" fontSize="10" fontWeight="700" fill="var(--color-target)">
              Goal {formatWeight(goal)}
            </text>
          </g>
        ) : null}
        {points.length > 1 && (
          <path d={`${path} L${sx(points[points.length - 1].x).toFixed(1)},${H - BOTTOM} L${sx(points[0].x).toFixed(1)},${H - BOTTOM} Z`} fill="url(#chart-fill)" />
        )}
        <path d={path} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        {points.map((p, i) => (
          <g key={i} onClick={() => setSelected(i)} className="cursor-pointer">
            <circle cx={sx(p.x)} cy={sy(p.y)} r="14" fill="transparent" />
            <circle
              cx={sx(p.x)}
              cy={sy(p.y)}
              r={p === active ? 5 : 3.5}
              fill={p === active ? color : 'var(--color-surface)'}
              stroke={color}
              strokeWidth="2"
            />
          </g>
        ))}
      </svg>
    </div>
  )
}
