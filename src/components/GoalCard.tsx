import { useState, type CSSProperties } from 'react'
import { goalProgress, type WeighIn } from '../lib/bodyWeight'
import { convertWeight } from '../lib/units'
import type { WeightUnit } from '../types/db'
import { Button } from './Button'
import { TrophyIcon } from './icons'
import { Sheet } from './Sheet'

interface Props {
  weighIns: WeighIn[]
  unit: WeightUnit
  goal: { weight: number; unit: WeightUnit } | null
  onSetGoal: (goal: { weight: number; unit: WeightUnit } | null) => Promise<void>
}

/** The goal weight with a progress bar from the first weigh-in, and a sheet to change it. */
export function GoalCard({ weighIns, unit, goal, onSetGoal }: Props) {
  const [editing, setEditing] = useState(false)
  const [text, setText] = useState('')
  const [error, setError] = useState<string | null>(null)
  const goalShown = goal ? convertWeight(goal.weight, goal.unit, unit) : null
  const progress = goalProgress(weighIns, goalShown)

  async function save(next: { weight: number; unit: WeightUnit } | null) {
    setError(null)
    try {
      await onSetGoal(next)
      setEditing(false)
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    }
  }

  const parsed = Number(text.replace(',', '.'))
  const valid = Number.isFinite(parsed) && parsed >= 20 && parsed < 2000

  return (
    <section className="card p-4">
      <div className="flex items-center gap-3">
        <span className="icon-tile" style={{ '--tint': 'var(--color-target)' } as CSSProperties}>
          <TrophyIcon />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold text-muted">Goal</p>
          <p className="font-display text-xl font-extrabold">{goalShown === null ? 'No goal set' : `${goalShown.toFixed(1)} ${unit}`}</p>
        </div>
        <Button size="sm" onClick={() => { setText(goalShown?.toFixed(1) ?? ''); setEditing(true) }}>
          {goal ? 'Change' : 'Set goal'}
        </Button>
      </div>
      {progress && (
        <div className="mt-4">
          <div className="h-3 overflow-hidden rounded-full bg-surface-2">
            <div className="h-full rounded-full transition-[width] duration-700" style={{ width: `${Math.round(progress.fraction * 100)}%`, background: progress.reached ? 'var(--color-target)' : 'var(--grad-accent)' }} />
          </div>
          <p className="mt-2 text-sm font-semibold text-muted">
            {progress.reached ? 'Goal reached. Nice work!' : `${Math.abs(progress.remaining).toFixed(1)} ${unit} to go · ${Math.round(progress.fraction * 100)}% of the way`}
          </p>
        </div>
      )}

      <Sheet open={editing} title="Goal weight" onClose={() => setEditing(false)}>
        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold text-muted">Goal in {unit}</span>
          <input inputMode="decimal" value={text} onChange={(e) => setText(e.target.value)} className="field font-display text-2xl font-extrabold" autoFocus />
        </label>
        {error && <p className="mt-2 text-sm text-danger">{error}</p>}
        <div className="mt-4 grid grid-cols-2 gap-2">
          <Button variant="ghost" disabled={!goal} onClick={() => save(null)}>
            Clear goal
          </Button>
          <Button variant="primary" disabled={!valid} onClick={() => save({ weight: Math.round(parsed * 10) / 10, unit })}>
            Save
          </Button>
        </div>
      </Sheet>
    </section>
  )
}
