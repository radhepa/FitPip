interface Props {
  /** What the display shows (already formatted). */
  reading: string
  unit: string
  /** Bumps each time a weigh-in is saved, to replay the step-on animation. */
  stepKey: number
}

/** A bathroom scale seen from above, with a glowing display. It squishes when you "step on". */
export function BathroomScale({ reading, unit, stepKey }: Props) {
  return (
    <div key={stepKey} className={stepKey > 0 ? 'scale-step' : ''}>
      <svg viewBox="0 0 240 190" className="mx-auto block w-full max-w-[17rem]" role="img" aria-label={`Scale reading ${reading} ${unit}`}>
        <defs>
          <linearGradient id="scale-top" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#eef3fb" />
            <stop offset="1" stopColor="#c9d4e6" />
          </linearGradient>
          <linearGradient id="scale-screen" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#0c1830" />
            <stop offset="1" stopColor="#15264a" />
          </linearGradient>
        </defs>
        <rect x="12" y="14" width="216" height="170" rx="40" fill="#000" opacity=".18" />
        <rect x="8" y="6" width="224" height="172" rx="40" fill="url(#scale-top)" />
        <rect x="8" y="6" width="224" height="172" rx="40" fill="none" stroke="#fff" strokeOpacity=".7" strokeWidth="2" />
        <rect x="62" y="22" width="116" height="48" rx="14" fill="url(#scale-screen)" />
        <rect x="62" y="22" width="116" height="48" rx="14" fill="none" stroke="#5b8cff" strokeOpacity=".5" />
        <text x="120" y="56" textAnchor="middle" fontFamily="Archivo Variable, sans-serif" fontWeight="800" fontSize="30" fill="#8fe3ff" style={{ filter: 'drop-shadow(0 0 6px rgba(143,227,255,.7))' }}>
          {reading}
        </text>
        <text x="170" y="64" textAnchor="end" fontSize="9" fontWeight="700" fill="#8fe3ff" opacity=".7">
          {unit}
        </text>
        {/* Foot pads */}
        <rect className="scale-foot" x="54" y="88" width="50" height="74" rx="25" fill="#b8c5da" />
        <rect className="scale-foot" x="136" y="88" width="50" height="74" rx="25" fill="#b8c5da" />
        {[0, 1, 2, 3, 4].map((i) => (
          <g key={i} opacity=".45">
            <line x1="64" x2="94" y1={100 + i * 12} y2={100 + i * 12} stroke="#8a9ab5" strokeWidth="2" strokeLinecap="round" />
            <line x1="146" x2="176" y1={100 + i * 12} y2={100 + i * 12} stroke="#8a9ab5" strokeWidth="2" strokeLinecap="round" />
          </g>
        ))}
      </svg>
    </div>
  )
}
