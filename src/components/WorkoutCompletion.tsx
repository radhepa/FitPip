import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useWorkoutCelebration } from '../hooks/useWorkoutCelebration'
import { CheckIcon } from './icons'
import { PipCelebration } from './PipCelebration'

/** Consume the navigation signal once, after the saved summary has loaded. */
export function WorkoutCompletion({ sessionId, justFinished, sets, pipLine = null }: {
  sessionId: string; justFinished: boolean; sets: number; pipLine?: string | null
}) {
  const [finishedHere] = useState(justFinished)
  const [open, setOpen] = useState(justFinished)
  const { celebration, another } = useWorkoutCelebration(sessionId, finishedHere)
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
      {open && celebration && <PipCelebration celebration={celebration} sets={sets} pipLine={pipLine} onAnother={another} onDismiss={() => setOpen(false)} />}
    </>
  )
}
