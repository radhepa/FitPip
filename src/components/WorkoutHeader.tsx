import { useState } from 'react'
import { Button } from './Button'
import { ElapsedClock } from './ElapsedClock'
import { CheckIcon } from './icons'
import { ProgressRing } from './ProgressRing'

interface Props {
  name: string
  /** Null while the workout is being set up: no clock runs until it begins. */
  startedAt: string | null
  /** Sets done out of the sets planned (null when nothing has a target). */
  progress: { done: number; target: number } | null
  onRename: (name: string) => void
  onFinish: () => void
  finishing: boolean
}

/** The workout's hero card: its name, the big clock, how far through the plan you are, and Finish. */
export function WorkoutHeader({ name, startedAt, progress, onRename, onFinish, finishing }: Props) {
  const [draft, setDraft] = useState(name)

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
          {startedAt ? (
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
          <ProgressRing value={progress.done / progress.target} size={76} stroke={8} label={`${progress.done} of ${progress.target} sets`}>
            <span className="text-sm leading-tight font-extrabold">
              {progress.done}
              <span className="text-muted">/{progress.target}</span>
            </span>
          </ProgressRing>
        )}
      </div>
      {startedAt && (
        <Button variant="primary" block className="mt-4" onClick={onFinish} disabled={finishing}>
          <CheckIcon /> {finishing ? 'Finishing…' : 'Finish workout'}
        </Button>
      )}
    </header>
  )
}
