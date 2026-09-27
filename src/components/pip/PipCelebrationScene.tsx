import type { CSSProperties } from 'react'
import type { PipCelebration } from '../../config/pipCelebrations'
import { Pip } from '../Pip'

function BurstShape({ effect, index }: { effect: PipCelebration['effect']; index: number }) {
  if (effect === 'hearts') return <path d="M0 6C-18-5-7-17 0-8 7-17 18-5 0 6Z" fill="currentColor" />
  if (effect === 'music') return (
    <g fill="currentColor"><path d="M0 0v-17l11-3v4l-8 2V0Z" /><ellipse cx="-2" rx="5" ry="3.5" /></g>
  )
  if (effect === 'stars') return <path d="m0-9 2.7 5.5 6.1.9-4.4 4.3 1 6.1L0 4-5.4 6.8l1-6.1-4.4-4.3 6.1-.9Z" fill="currentColor" />
  if (index % 3 === 0) return <path d="m0-7 2 5 5 2-5 2-2 5-2-5-5-2 5-2Z" fill="currentColor" />
  return <rect x="-3" y="-5" width="6" height="10" rx="2" fill="currentColor" />
}

/** Keep the character and its accent burst on the same replayable timeline. */
export function PipCelebrationScene({ celebration }: { celebration: PipCelebration }) {
  const { id, effect, accent, burstAt, praiseAt, praise } = celebration
  const highFive = effect === 'high-five'
  const hearts = effect === 'hearts'
  const count = effect === 'confetti' ? 16 : 10
  return (
    <div className={`completion-scene completion-scene--${effect}`} aria-hidden="true" style={{
      '--completion-tint': accent, '--praise-delay': `${praiseAt}ms`,
    } as CSSProperties}>
      <div className="completion-halo" />
      <svg className="completion-burst" viewBox="0 0 320 300" focusable="false">
        {Array.from({ length: count }, (_, i) => {
          const angle = i * Math.PI * 2 / count
          return (
            <g key={i} transform={highFive ? 'translate(225 118)' : 'translate(160 155)'}>
              <g className="completion-bit" style={{
                '--burst-x': `${Math.cos(angle) * (highFive ? 50 : i % 2 ? 138 : 112)}px`,
                '--burst-y': `${hearts ? -50 - Math.abs(Math.sin(angle)) * 105 : Math.sin(angle) * (highFive ? 52 : 108) - 24}px`,
                '--burst-turn': `${hearts || effect === 'music' ? (i % 2 ? 18 : -18) : i % 2 ? 100 : -120}deg`,
                '--burst-delay': `${burstAt + i % 3 * 70}ms`,
                color: [accent, '#ffe2a0', '#c5b1ff', accent][i % 4],
              } as CSSProperties}>
                <BurstShape effect={effect} index={i} />
              </g>
            </g>
          )
        })}
      </svg>
      <Pip reaction={id} size={240} />
      <span className="completion-praise">{praise}</span>
    </div>
  )
}
