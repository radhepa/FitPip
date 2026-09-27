import type { PipTalk as TalkKind } from '../lib/pip/types'
import type { Said } from '../lib/pip/voice'
import './pip/talk.css'

const CHIPS: { kind: TalkKind; label: string }[] = [
  { kind: 'progress', label: 'How am I doing?' },
  { kind: 'throwback', label: 'Throwback' },
  { kind: 'pep', label: 'Pep talk' },
]

interface Props {
  said: Said | null
  onTalk: (kind: TalkKind) => void
  onChoose: (index: number) => void
}

/** What you can say to Pip: his quick replies while he has asked something, else the three "ask Pip" chips. */
export function PipTalk({ said, onTalk, onChoose }: Props) {
  const choices = said?.choices
  return (
    <div key={choices ? 'question' : 'chips'} className="pip-talk pip-talk-in" role="group" aria-label={choices ? 'Answer Pip' : 'Ask Pip'}>
      {choices
        ? choices.map((choice, i) => (
            <button key={choice.label} type="button" className="pip-chip pip-chip--reply" onClick={() => onChoose(i)}>
              {choice.label}
            </button>
          ))
        : CHIPS.map(({ kind, label }) => (
            <button key={kind} type="button" className="pip-chip" onClick={() => onTalk(kind)}>
              {label}
            </button>
          ))}
    </div>
  )
}
