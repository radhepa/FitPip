import { useMemo, useState } from 'react'
import { confetti } from '../components/fx'
import { ErrorBanner, Loading } from '../components/feedback'
import { GoalCard } from '../components/GoalCard'
import { LineChart } from '../components/LineChart'
import { PageHeader } from '../components/PageHeader'
import { PipNote } from '../components/PipNote'
import { WeighInPanel } from '../components/WeighInPanel'
import { WeightHistory } from '../components/WeightHistory'
import { WeightStats } from '../components/WeightStats'
import { deleteBodyWeight, listBodyWeights, saveBodyWeight } from '../data/bodyWeights'
import { errorMessage } from '../data/unwrap'
import { useAsync } from '../hooks/useAsync'
import { useAuth } from '../hooks/useAuth'
import { usePipFacts } from '../hooks/usePipFacts'
import { useSettings } from '../hooks/useSettings'
import { dateMs, goalProgress, toWeighIns } from '../lib/bodyWeight'
import { weightNotes } from '../lib/pip/notes'
import { convertWeight } from '../lib/units'

const RANGES = [
  { days: 30, label: '30d' },
  { days: 90, label: '90d' },
  { days: 0, label: 'All' },
] as const

/** The scale: log today's weight, see the trend, and track a goal. */
export function WeighInScreen() {
  const { session } = useAuth()
  const { unit, goal, setGoal } = useSettings()
  const rows = useAsync(listBodyWeights, [], { cacheKey: 'body-weights' })
  const [range, setRange] = useState<number>(30)
  const [error, setError] = useState<string | null>(null)
  const [openedAt] = useState(() => Date.now())

  const weighIns = useMemo(() => toWeighIns(rows.data ?? [], unit), [rows.data, unit])
  // Pip reacts to your weigh-ins as you save them, using the list on screen rather than waiting for a reload.
  const pipFacts = usePipFacts({ weights: rows.data })
  const pipNotes = useMemo(() => (pipFacts ? weightNotes(pipFacts) : []), [pipFacts])
  const goalShown = goal ? convertWeight(goal.weight, goal.unit, unit) : null
  const points = useMemo(() => {
    const from = range === 0 ? 0 : openedAt - range * 24 * 60 * 60 * 1000
    return weighIns.filter((w) => dateMs(w.date) >= from).map((w) => ({ x: dateMs(w.date), y: w.weight }))
  }, [weighIns, range, openedAt])

  async function save(date: string, weight: number) {
    if (!session) return
    const before = goalProgress(weighIns, goalShown)
    const saved = await saveBodyWeight(session.user.id, { measuredOn: date, weight, unit })
    const next = [...(rows.data ?? []).filter((r) => r.measured_on !== saved.measured_on), saved]
    rows.setData(next)
    const after = goalProgress(toWeighIns(next, unit), goalShown)
    const newLow = weighIns.length > 2 && weight < Math.min(...weighIns.map((w) => w.weight))
    if ((after?.reached && !before?.reached) || (goalShown !== null && goalShown < weighIns[0]?.weight && newLow)) confetti()
  }

  async function remove(id: string) {
    setError(null)
    const before = rows.data
    rows.setData((prev) => (prev ?? []).filter((r) => r.id !== id))
    try {
      await deleteBodyWeight(id)
    } catch (e) {
      rows.setData(before)
      setError(errorMessage(e))
    }
  }

  const start = weighIns.at(-1)?.weight ?? (unit === 'kg' ? 75 : 165)

  return (
    <>
      <PageHeader eyebrow="Body" title="Weigh-in" subtitle="One weigh-in a day. Watch the trend, not the wiggle." />
      <ErrorBanner error={rows.error} onRetry={rows.reload} />
      {pipNotes.length > 0 && <PipNote notes={pipNotes} />}
      {rows.loading && !rows.data ? (
        <Loading rows={3} />
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:items-start">
          <div className="grid grid-cols-1 gap-4">
            <WeighInPanel key={rows.data ? 'ready' : 'loading'} unit={unit} startWeight={start} takenDates={new Set(weighIns.map((w) => w.date))} onSave={save} />
            <GoalCard weighIns={weighIns} unit={unit} goal={goal} onSetGoal={setGoal} />
          </div>
          <div className="grid grid-cols-1 gap-4">
            {weighIns.length > 0 && <WeightStats weighIns={weighIns} unit={unit} />}
            {weighIns.length > 0 && (
              <section>
                <div className="section-heading">
                  <h2>Trend</h2>
                  <div className="segmented" role="group" aria-label="Chart range">
                    {RANGES.map((r) => (
                      <button key={r.days} type="button" aria-pressed={range === r.days} onClick={() => setRange(r.days)}>
                        {r.label}
                      </button>
                    ))}
                  </div>
                </div>
                {points.length > 0 ? <LineChart points={points} unit={unit} goal={goalShown} /> : <p className="card card-pad text-sm text-muted">No weigh-ins in this range.</p>}
              </section>
            )}
            {error && <p className="text-sm text-danger">{error}</p>}
            {weighIns.length > 0 && (
              <section>
                <div className="section-heading">
                  <h2>History</h2>
                  <span className="text-sm font-semibold text-muted">{weighIns.length} weigh-ins</span>
                </div>
                <WeightHistory weighIns={weighIns} unit={unit} onDelete={remove} />
              </section>
            )}
          </div>
        </div>
      )}
    </>
  )
}
