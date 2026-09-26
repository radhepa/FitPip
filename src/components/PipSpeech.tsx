import { useEffect, useRef, useState } from 'react'
import { usePipLine } from '../hooks/usePipLine'
import { buzz } from './fx'
import { Pip, type PipPose, type PipReaction } from './Pip'

interface Props {
  pose?: PipPose
  size?: number
  /** Say this instead of the rotating line (the tap still deals a new one). */
  override?: string
}

const reactions: PipReaction[] = ['wave', 'bounce', 'love']

/** Every tap deals a new line and a brief reaction, then returns to the page's pose. */
export function PipSpeech({ pose = 'idle', size = 96, override }: Props) {
  const { line, index, next } = usePipLine()
  const [taps, setTaps] = useState(0)
  const [reaction, setReaction] = useState<PipReaction>()
  const settleTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const [overridden, setOverridden] = useState(Boolean(override))
  const said = overridden && override ? override : line

  useEffect(() => () => clearTimeout(settleTimer.current), [])

  return (
    <div className="flex items-end gap-3">
      <button
        type="button"
        onClick={() => {
          buzz(8)
          setOverridden(false)
          clearTimeout(settleTimer.current)
          setReaction(reactions[taps % reactions.length])
          setTaps((t) => t + 1)
          settleTimer.current = setTimeout(() => setReaction(undefined), 2800)
          next()
        }}
        aria-label="Tap Pip for another tip"
        className="pip-button shrink-0 cursor-pointer rounded-full border-0 bg-transparent p-0"
        style={{ width: size, maxWidth: '38%' }}
      >
        <Pip pose={pose} reaction={reaction} reactionId={taps} size={size} />
      </button>
      <p className="speech mb-3 min-w-0 flex-1 text-[.95rem]" aria-live="polite" aria-atomic="true">
        <span key={`${index}-${taps}`} className="speech-in block">{said}</span>
      </p>
    </div>
  )
}
