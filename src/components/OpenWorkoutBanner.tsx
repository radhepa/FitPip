import { useState } from 'react'
import { Link } from 'react-router-dom'
import { sessionTitle } from '../lib/format'
import { STALE_AFTER_MS } from '../lib/staleWorkout'
import type { Session } from '../types/db'
import { ElapsedClock } from './ElapsedClock'
import { ChevronIcon, PauseIcon } from './icons'

/** A workout that is set up or running: jump back into it. */
export function OpenWorkoutBanner({ session }: { session: Session }) {
  const [shownAt] = useState(() => Date.now())
  const running = session.started_at !== null
  // Hours in: most likely it was never finished (the workout screen offers to finish it at the last set).
  const forgotten = running && shownAt - new Date(session.started_at!).getTime() > STALE_AFTER_MS
  return (
    <Link to={`/workout/${session.id}`} className="card card-hero pressable flex items-center gap-4 p-4">
      <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-white/10">
        {running ? <span className="live-dot" /> : <PauseIcon />}
      </span>
      <div className="min-w-0 flex-1">
        <p className={`text-xs font-bold ${forgotten ? 'text-accent' : 'text-muted'}`}>{forgotten ? 'Still open. Forgot to finish?' : running ? 'Workout in progress' : 'Set up, not started'}</p>
        <p className="truncate text-lg font-extrabold">{sessionTitle(session)}</p>
      </div>
      {running && session.started_at && (
        <span className="font-display text-2xl font-extrabold text-accent">
          <ElapsedClock startedAt={session.started_at} />
        </span>
      )}
      <ChevronIcon />
    </Link>
  )
}
