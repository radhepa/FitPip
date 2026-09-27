import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { createPortal } from 'react-dom'
import { useLocation, useNavigate } from 'react-router-dom'
import { Button } from './Button'
import { CheckIcon } from './icons'
import { Pip } from './Pip'
import './workoutCompletion.css'

/**
 * Consume the navigation signal once, after the saved summary has loaded. `pipLine` is what Pip
 * has to say about this particular workout (a record, a streak...), when he has something.
 */
export function WorkoutCompletion({ justFinished, sets, pipLine = null }: { justFinished: boolean; sets: number; pipLine?: string | null }) {
  const [finishedHere] = useState(justFinished)
  const [open, setOpen] = useState(justFinished)
  const replayRef = useRef<HTMLButtonElement>(null)
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    if (!justFinished) return
    // History and reloads should show the workout, without celebrating it again.
    navigate(location.pathname + location.search + location.hash, {
      replace: true,
      state: { ...location.state, justFinished: false },
    })
  }, [justFinished, location, navigate])

  useEffect(() => {
    if (finishedHere && !open) replayRef.current?.focus({ preventScroll: true })
  }, [finishedHere, open])

  if (!finishedHere) return null
  return (
    <>
      <section className="card card-hero mb-4 flex flex-wrap items-center justify-between gap-2 p-4">
        <p className="flex items-center gap-2 font-bold"><CheckIcon /> Workout complete. Proud of you!</p>
        <button ref={replayRef} type="button" className="app-button button-ghost button-sm" onClick={() => setOpen(true)}>Celebrate with Pip</button>
      </section>
      {open && <PipCelebration sets={sets} pipLine={pipLine} onDismiss={() => setOpen(false)} />}
    </>
  )
}

/** Native modal keeps focus inside, supports Escape, and sits above the app's page transitions. */
function PipCelebration({ sets, pipLine, onDismiss }: { sets: number; pipLine: string | null; onDismiss: () => void }) {
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
      aria-labelledby="pip-complete-title"
      aria-describedby={pipLine ? 'pip-complete-message pip-complete-note' : 'pip-complete-message'}
      onCancel={(event) => { event.preventDefault(); onDismiss() }}
    >
      <div className="completion-content">
        <p className="completion-eyebrow"><CheckIcon size="size-4" /> Workout complete</p>
        <div key={replay} className="completion-scene" aria-hidden="true">
          <div className="completion-halo" />
          <svg className="completion-burst" viewBox="0 0 320 300" focusable="false">
            {Array.from({ length: 16 }, (_, i) => {
              const angle = i * Math.PI * 2 / 16
              return (
                <g key={i} transform="translate(160 155)">
                  <g className="completion-bit" style={{
                    '--burst-x': `${Math.cos(angle) * (i % 2 ? 138 : 112)}px`,
                    '--burst-y': `${Math.sin(angle) * 108 - 24}px`,
                    '--burst-turn': `${i % 2 ? 100 : -120}deg`,
                    '--burst-delay': `${740 + i % 3 * 55}ms`,
                    color: ['#8ecbff', '#ffe2a0', '#c5b1ff', '#83e5ce'][i % 4],
                  } as CSSProperties}>
                    {i % 3 === 0
                      ? <path d="m0-7 2 5 5 2-5 2-2 5-2-5-5-2 5-2Z" fill="currentColor" />
                      : <rect x="-3" y="-5" width="6" height="10" rx="2" fill="currentColor" />}
                  </g>
                </g>
              )
            })}
          </svg>
          <Pip reaction="celebrate" size={240} />
          <span className="completion-praise">So proud of you!</span>
        </div>
        <h2 id="pip-complete-title" className="completion-title">You did it!</h2>
        <p id="pip-complete-message" className="completion-message">You showed up. You put in the work.<br />That deserves a little happy dance.</p>
        {pipLine && <p id="pip-complete-note" className="completion-note">{pipLine}</p>}
        <p className="completion-saved"><CheckIcon size="size-4" /> {sets} {sets === 1 ? 'set' : 'sets'} in the books. Workout saved.</p>
        <Button autoFocus variant="primary" block onClick={onDismiss}>View workout</Button>
        <Button variant="ghost" size="sm" className="completion-replay" onClick={() => setReplay((n) => n + 1)}>Replay Pip’s celebration</Button>
      </div>
    </dialog>,
    document.body,
  )
}
