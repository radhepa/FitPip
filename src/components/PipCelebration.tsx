import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { createPortal } from 'react-dom'
import type { PipCelebration as Celebration } from '../config/pipCelebrations'
import { Button } from './Button'
import { CheckIcon } from './icons'
import { PipCelebrationScene } from './pip/PipCelebrationScene'
import './workoutCompletion.css'

interface Props {
  celebration: Celebration
  sets: number
  pipLine: string | null
  onDismiss: () => void
  onAnother: () => void
}

/** Replay never changes the choice. Another celebration deals the next unseen finish. */
export function PipCelebration({ celebration, sets, pipLine, onDismiss, onAnother }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [replay, setReplay] = useState(0)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    const previousOverflow = document.body.style.overflow
    dialog.showModal()
    document.body.style.overflow = 'hidden'
    return () => {
      dialog.close()
      document.body.style.overflow = previousOverflow
    }
  }, [])

  return createPortal(
    <dialog
      ref={dialogRef}
      className="workout-celebration"
      style={{ '--completion-tint': celebration.accent } as CSSProperties}
      aria-labelledby="pip-complete-title"
      aria-describedby={pipLine ? 'pip-complete-message pip-complete-note' : 'pip-complete-message'}
      onCancel={(event) => { event.preventDefault(); onDismiss() }}
    >
      <div className="completion-content">
        <p className="completion-eyebrow"><CheckIcon size="size-4" /> Workout complete</p>
        <PipCelebrationScene key={`${celebration.id}-${replay}`} celebration={celebration} />
        <div aria-live="polite" aria-atomic="true">
          <h2 id="pip-complete-title" className="completion-title">{celebration.title}</h2>
          <p id="pip-complete-message" className="completion-message">{celebration.message[0]}<br />{celebration.message[1]}</p>
        </div>
        {pipLine && <p id="pip-complete-note" className="completion-note">{pipLine}</p>}
        <p className="completion-saved"><CheckIcon size="size-4" /> {sets} {sets === 1 ? 'set' : 'sets'} in the books. Workout saved.</p>
        <Button autoFocus variant="primary" block onClick={onDismiss}>View workout</Button>
        <div className="completion-controls">
          <Button variant="ghost" size="sm" aria-label="Replay Pip’s celebration" onClick={() => setReplay((n) => n + 1)}>Replay</Button>
          <Button variant="ghost" size="sm" onClick={onAnother}>Another celebration</Button>
        </div>
      </div>
    </dialog>,
    document.body,
  )
}
