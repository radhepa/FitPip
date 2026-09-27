import { useEffect, useState } from 'react'
import { usePipGesture } from '../hooks/usePipGesture'
import type { PipMoment } from '../lib/pip/types'
import { buzz } from './fx'
import { Pip } from './Pip'
import './pip/talk.css'

interface Props {
  /** What Pip has to say here, best first. Tap him for the next one. */
  notes: PipMoment[]
  size?: number
}

/** A small Pip with a remark about the page you are on (your weight, on the Weigh-in screen). */
export function PipNote({ notes, size = 76 }: Props) {
  const [pick, setPick] = useState({ top: '', index: 0 })
  const { reaction, nonce, play } = usePipGesture()
  const top = notes[0]?.id ?? ''
  // A new best remark (after a weigh-in, say) starts again from the top.
  const index = pick.top === top ? pick.index : 0
  const note = notes[index]

  // Pip acts out each remark, so good news gets a celebration.
  useEffect(() => {
    if (note) play(note.mood)
    // play is stable; the remark's id says when it changed
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [note?.id])

  if (!note) return null
  const next = () => {
    buzz(8)
    setPick({ top, index: (index + 1) % notes.length })
  }

  return (
    <section className="card card-pad mb-4" aria-label="Pip's thoughts">
      <div className="flex items-end gap-3">
        <button
          type="button"
          onClick={next}
          disabled={notes.length < 2}
          aria-label={notes.length < 2 ? 'Pip' : 'Tap Pip for another thought'}
          className="pip-button shrink-0 cursor-pointer rounded-full border-0 bg-transparent p-0 disabled:cursor-default"
          style={{ width: size, maxWidth: '30%' }}
        >
          <Pip pose="idle" reaction={reaction} reactionId={nonce} size={size} />
        </button>
        <p className="speech mb-2 min-w-0 flex-1 text-[.92rem]" aria-live="polite" aria-atomic="true">
          <span key={`${note.id}-${nonce}`} className="speech-in block">
            {note.text}
          </span>
        </p>
      </div>
    </section>
  )
}
