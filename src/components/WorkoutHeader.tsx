import { useState } from 'react'
import { usePendingEdit } from '../hooks/usePendingEdit'
import { Button } from './Button'
import { ElapsedClock } from './ElapsedClock'
import { countOf, formatClock } from '../lib/format'
import { CheckIcon } from './icons'
import { ProgressRing } from './ProgressRing'

interface Props {
  name: string
  /** Null while the workout is being set up: no clock runs until it begins. */
  startedAt: string | null
  /** Set when a finished workout is being edited: its recorded time is shown and never changes. */
  endedAt?: string | null
  /** Sets done out of the sets planned (null when nothing has a target). */
  progress: { done: number; target: number } | null
  onRename: (name: string) => void | Promise<void>
  onFinish: () => void
  finishing: boolean
  /** Editing a finished workout: leaves the edit screen (nothing is "finished" again). */
  onDone?: () => void
}

/** The workout's hero card: its name, the big clock, how far through the plan you are, and Finish. */
export function WorkoutHeader({ name, startedAt, endedAt = null, progress, onRename, onFinish, finishing, onDone }: Props) {
  const editing = endedAt !== null && startedAt !== null
  const [draft, setDraft] = useState(name)
  // Finish can come before the name field loses focus (iPhone): it saves the typed name first.
  usePendingEdit(() => (draft.trim() !== name ? onRename(draft.trim()) : undefined))

  return (
    <header className="card card-hero mb-2 p-4">
      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => draft.trim() !== name && onRename(draft.trim())}
        placeholder="Name this workout"
        maxLength={80}
        aria-label="Workout name"
        className="w-full bg-transparent font-display text-[1.6rem] leading-tight font-extrabold outline-none placeholder:text-muted"
      />
      <div className="mt-3 flex items-center gap-4">
        <div className="min-w-0 flex-1">
          {editing ? (
            <>
              <p className="font-display text-[3.75rem] leading-none font-extrabold text-muted" aria-label="Recorded time">
                {formatClock(new Date(endedAt).getTime() - new Date(startedAt).getTime())}
              </p>
              <p className="mt-1 text-sm font-semibold text-muted">Editing a finished workout. Its time stays as recorded.</p>
            </>
          ) : startedAt ? (
            <p className="gradient-text font-display text-[3.75rem] leading-none font-extrabold">
              <ElapsedClock startedAt={startedAt} />
            </p>
          ) : (
            <>
              <p className="font-display text-[3.75rem] leading-none font-extrabold text-muted/60">0:00</p>
              <p className="mt-1 text-sm font-semibold text-muted">The clock starts when you begin.</p>
            </>
          )}
        </div>
        {progress && progress.target > 0 && (
          <ProgressRing value={progress.done / progress.target} size={76} stroke={8} label={`${progress.done} of ${countOf(progress.target, 'set')}`}>
            <span className="text-sm leading-tight font-extrabold">
              {progress.done}
              <span className="text-muted">/{progress.target}</span>
            </span>
          </ProgressRing>
        )}
      </div>
      {startedAt && (
        <Button variant="primary" block className="mt-4" onClick={editing ? onDone : onFinish} disabled={finishing}>
          <CheckIcon /> {editing ? 'Done editing' : finishing ? 'Finishing…' : 'Finish workout'}
        </Button>
      )}
    </header>
  )
}
