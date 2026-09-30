import { useState, type ReactNode } from 'react'
import { usePendingEdit } from '../hooks/usePendingEdit'
import { Button } from './Button'
import { ElapsedClock } from './ElapsedClock'
import { countOf, formatClock, formatTime } from '../lib/format'
import { CheckIcon, PencilIcon } from './icons'
import { ProgressRing } from './ProgressRing'

interface Props {
  name: string
  /** Null while the workout is being set up: no clock runs until it begins. */
  startedAt: string | null
  /** Set when a finished workout is being edited: its recorded time is shown (it only changes through onEditTime). */
  endedAt?: string | null
  /** Sets done out of the sets planned (null when nothing has a target). */
  progress: { done: number; target: number } | null
  onRename: (name: string) => void | Promise<void>
  onFinish: () => void
  finishing: boolean
  /** Editing a finished workout: leaves the edit screen (nothing is "finished" again). */
  onDone?: () => void
  /** Opens the sheet that corrects when it started (and finished). */
  onEditTime?: () => void
}

/** The workout's hero card: its name, the big clock, how far through the plan you are, and Finish. */
export function WorkoutHeader({ name, startedAt, endedAt = null, progress, onRename, onFinish, finishing, onDone, onEditTime }: Props) {
  const editing = endedAt !== null && startedAt !== null
  // Null until something is typed, so the saved name shows (and a rename from elsewhere is never undone).
  const [draft, setDraft] = useState<string | null>(null)
  const rename = () => {
    if (draft === null) return undefined
    const next = draft.trim()
    if (next === name) {
      setDraft(null)
      return undefined
    }
    // Keep showing what was typed until the save lands, then follow the saved name again.
    return Promise.resolve(onRename(next)).then(() => setDraft((current) => (current === draft ? null : current)))
  }
  // Finish can come before the name field loses focus (iPhone): it saves the typed name first.
  usePendingEdit(rename)

  return (
    <header className="card card-hero mb-2 p-4">
      <input
        value={draft ?? name}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => void rename()}
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
              <TimeLink onClick={onEditTime}>
                {formatTime(startedAt)} to {formatTime(endedAt)} · Change time
              </TimeLink>
            </>
          ) : startedAt ? (
            <>
              <p className="gradient-text font-display text-[3.75rem] leading-none font-extrabold">
                <ElapsedClock startedAt={startedAt} />
              </p>
              <TimeLink onClick={onEditTime}>Started {formatTime(startedAt)} · Change</TimeLink>
            </>
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

/** The small "change time" line under the clock (just text when there is nothing to open). */
function TimeLink({ onClick, children }: { onClick?: () => void; children: ReactNode }) {
  if (!onClick) return <p className="mt-1 text-sm font-semibold text-muted">{children}</p>
  return (
    <button type="button" onClick={onClick} className="mt-1 inline-flex min-h-9 items-center gap-1.5 text-left text-sm font-bold text-muted underline-offset-2 hover:underline">
      <PencilIcon size="size-4" /> {children}
    </button>
  )
}
