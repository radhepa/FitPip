import { usePipFacts } from '../hooks/usePipFacts'
import { usePipVoice } from '../hooks/usePipVoice'
import type { PlanInput } from '../lib/pip/planFacts'
import { Pip, type PipPose } from './Pip'
import { PipTalk } from './PipTalk'

interface Props {
  pose?: PipPose
  size?: number
  /** Today's plan and the week so far, so Pip can talk about them. Memoise it. */
  plan?: PlanInput | null
  /** False while the page is still loading the plan, so Pip waits rather than opening with half the picture. */
  ready?: boolean
}

/**
 * Pip with a speech bubble. He opens with what fits your day, says something new and acts it out
 * on every tap, and has three chips (how am I doing, throwback, pep talk) for talking back.
 */
export function PipSpeech({ pose = 'idle', size = 96, plan = null, ready = true }: Props) {
  const facts = usePipFacts({ plan, ready })
  const voice = usePipVoice({ facts, base: pose })

  return (
    <div>
      <div className="flex items-end gap-3">
        <button
          type="button"
          onClick={voice.tap}
          aria-label="Tap Pip to hear something new"
          className="pip-button shrink-0 cursor-pointer rounded-full border-0 bg-transparent p-0"
          style={{ width: size, maxWidth: '38%' }}
        >
          <Pip pose={pose} reaction={voice.reaction} reactionId={voice.nonce} size={size} />
        </button>
        <p className="speech mb-3 min-w-0 flex-1 text-[.95rem]" aria-live="polite" aria-atomic="true" aria-busy={voice.said === null}>
          {voice.said ? (
            <span key={voice.nonce} className="speech-in block">
              {voice.said.text}
            </span>
          ) : (
            <span className="pip-typing" role="status" aria-label="Pip is thinking">
              <i />
              <i />
              <i />
            </span>
          )}
        </p>
      </div>
      <PipTalk said={voice.said} onTalk={voice.talk} onChoose={voice.choose} />
    </div>
  )
}
