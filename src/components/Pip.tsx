import { useId, type CSSProperties } from 'react'
import { usePipMotion } from '../hooks/usePipMotion'
import { PipArms, PipBody, PipDefs, PipEffects, PipTail } from './pip/PipArt'
import { PipFace } from './pip/PipFace'
import type { PipPose, PipReaction } from './pip/types'
import './pip/pip.css'
import './pip/celebrate.css'
import './pip/everyday.css'

export type { PipPose, PipReaction } from './pip/types'

interface Props {
  pose?: PipPose
  size?: number
  line?: string
  reaction?: PipReaction
  reactionId?: number
}

const descriptions: Record<PipPose | PipReaction, string> = {
  idle: 'Pip, your blue panda companion',
  cheer: 'Pip celebrating',
  sleep: 'Pip curled up asleep',
  think: 'Pip thinking',
  wave: 'Pip waving hello',
  bounce: 'Pip jumping for joy',
  love: 'Pip sending you love',
  celebrate: 'Pip jumping for joy with both paws raised. Proud of you!',
  stretch: 'Pip reaching up for a big stretch',
  dance: 'Pip doing a little happy dance',
  peekaboo: 'Pip hiding behind his paws, then playing peekaboo',
  flex: 'Pip flexing his little muscles',
  nod: 'Pip giving you an encouraging nod',
  yawn: 'Pip having a sleepy yawn',
}

/** A layered SVG rig: movement, breathing, head, gaze and limbs have separate pivots. */
export function Pip({ pose = 'idle', size = 140, line, reaction, reactionId = 0 }: Props) {
  const id = useId().replace(/:/g, '')
  const { ref, paused, onPointerMove, resetGaze } = usePipMotion()
  const mood = reaction ?? pose
  const phase = [...id].reduce((sum, char) => sum + char.charCodeAt(0), 0) % 29
  const style = { width: size, '--pip-phase': `${-phase / 7}s` } as CSSProperties

  return (
    <figure
      ref={ref}
      className={`pip-figure pip--${mood}${paused ? ' pip--paused' : ''}`}
      style={style}
      onPointerMove={onPointerMove}
      onPointerLeave={resetGaze}
      onPointerCancel={resetGaze}
    >
      <svg viewBox="0 0 260 260" role="img" aria-label={descriptions[mood]} focusable="false">
        <PipDefs id={id} />
        <ellipse className="pip-aura" cx="133" cy="232" rx="79" ry="17" fill={`url(#${id}-aura)`} />
        <g key={`${mood}-${reactionId}`}>
          <ellipse className="pip-shadow" cx="135" cy="234" rx="48" ry="8" fill="#07162E" opacity=".2" />
          <g className="pip-arrival">
            <g className="pip-action">
              <g className="pip-breathe">
                <PipTail id={id} />
                <PipBody id={id} />
                <g className="pip-head-position">
                  <g className="pip-head">
                    <g className="pip-head-follow">
                      <PipFace id={id} mood={mood} />
                    </g>
                  </g>
                </g>
                <PipArms id={id} />
                <path className="pip-sleep-tail" d="M72 209c22 25 71 29 109 7" fill="none" stroke={`url(#${id}-tail)`} strokeWidth="29" strokeLinecap="round" />
                <path className="pip-sleep-tail" d="m97 225 4-24m26 30 1-24m26 23-4-22" fill="none" stroke="#D0E9FF" strokeWidth="12" />
              </g>
            </g>
          </g>
          <PipEffects mood={mood} />
        </g>
      </svg>
      {line && <figcaption>{line}</figcaption>}
    </figure>
  )
}
