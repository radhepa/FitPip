import type { ReactNode } from 'react'

interface Props {
  /** 0..1 */
  value: number
  /** Diameter in px. */
  size?: number
  stroke?: number
  /** Ring colour (any CSS colour); defaults to the accent gradient. */
  color?: string
  children?: ReactNode
  label?: string
}

/** A circular progress ring that animates to its value, with anything in the middle. */
export function ProgressRing({ value, size = 64, stroke = 7, color, children, label }: Props) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const clamped = Math.max(0, Math.min(1, Number.isFinite(value) ? value : 0))
  const gradientId = `ring-${size}-${stroke}`
  return (
    <div className="relative inline-grid shrink-0 place-items-center" style={{ width: size, height: size }} role={label ? 'img' : undefined} aria-label={label}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90" aria-hidden="true">
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#4f8cff" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--color-surface-2)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color ?? `url(#${gradientId})`}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - clamped)}
          style={{ transition: 'stroke-dashoffset 700ms cubic-bezier(.2,.7,.2,1)' }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">{children}</div>
    </div>
  )
}
