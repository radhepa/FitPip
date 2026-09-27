import { lastActivityLabel } from '../lib/staleWorkout'
import { Button } from './Button'

interface Props {
  /** The last set's time (or the start, with no sets). */
  lastAt: string
  hasSets: boolean
  busy: boolean
  onFinishAtLast: () => void
  onDiscard: () => void
  onKeepGoing: () => void
}

/** A workout left running for hours: finish it when the last set was logged, not now. */
export function ForgottenWorkout({ lastAt, hasSets, busy, onFinishAtLast, onDiscard, onKeepGoing }: Props) {
  const when = lastActivityLabel(lastAt)
  return (
    <section role="status" className="card card-pad mb-3 border-accent/40">
      <p className="font-display text-lg font-extrabold">Forgot to finish?</p>
      <p className="mt-1 text-sm text-muted">
        {hasSets
          ? `Nothing has been logged since ${when}. Finish it then, so its time isn't counted up to now.`
          : `This workout started ${when} and nothing was logged.`}
      </p>
      <div className="mt-3 grid grid-cols-2 gap-2">
        {hasSets ? (
          <Button variant="primary" size="sm" disabled={busy} onClick={onFinishAtLast}>
            Finish at {when.replace(/^yesterday /, '')}
          </Button>
        ) : (
          <Button variant="danger" size="sm" disabled={busy} onClick={onDiscard}>
            Discard it
          </Button>
        )}
        <Button size="sm" disabled={busy} onClick={onKeepGoing}>
          Keep going
        </Button>
      </div>
    </section>
  )
}
