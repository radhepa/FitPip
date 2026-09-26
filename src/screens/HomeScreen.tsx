import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { ErrorBanner, Loading } from '../components/feedback'
import { OpenWorkoutBanner } from '../components/OpenWorkoutBanner'
import { PipSpeech } from '../components/PipSpeech'
import { SessionListItem } from '../components/SessionListItem'
import { StatTiles } from '../components/StatTiles'
import { TodayLineup } from '../components/TodayLineup'
import { WeekStrip } from '../components/WeekStrip'
import { ChevronIcon, SettingsIcon, SparkIcon } from '../components/icons'
import { useNewWorkout } from '../hooks/useNewWorkout'
import { useSettings } from '../hooks/useSettings'
import { useTodayData } from '../hooks/useTodayData'
import { changeOver, toWeighIns } from '../lib/bodyWeight'
import { greeting, weekStatus, weekTotals, workoutStreak } from '../lib/homeStats'
import { entriesForDay, planForDay, type TodayPlan } from '../lib/weekPlan'

const UNPLANNED: TodayPlan = { kind: 'unplanned' }

export function HomeScreen() {
  const { unit } = useSettings()
  const { open, recent, plan, history, weights } = useTodayData()
  const { create, creating, error: startError } = useNewWorkout()

  const now = new Date()
  const today = useMemo(() => (plan.data ? planForDay(plan.data.items, now.getDay(), { routines: plan.data.routines, exercises: plan.data.exercises }) : UNPLANNED), [plan.data]) // eslint-disable-line react-hooks/exhaustive-deps
  const plannedWeekdays = useMemo(() => {
    const data = plan.data
    if (!data) return new Set<number>()
    const lookup = { routines: data.routines, exercises: data.exercises }
    return new Set([0, 1, 2, 3, 4, 5, 6].filter((d) => entriesForDay(data.items, d, lookup).length > 0))
  }, [plan.data])
  const sessions = useMemo(() => history.data?.sessions ?? [], [history.data])
  const days = useMemo(() => weekStatus(sessions, plannedWeekdays), [sessions, plannedWeekdays])
  const totals = useMemo(() => weekTotals(sessions, days), [sessions, days])
  const weight = useMemo(() => {
    const list = toWeighIns(weights.data ?? [], unit)
    const latest = list.at(-1)
    return latest ? { latest: latest.weight, change: changeOver(list, 7), unit } : null
  }, [weights.data, unit])
  const exerciseById = useMemo(() => new Map((plan.data?.exercises ?? []).map((e) => [e.id, e])), [plan.data])

  const dateLine = now.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(20rem,.85fr)] lg:gap-10">
      <div className="min-w-0">
        <header className="mb-5 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="font-bold text-muted">{greeting(now)}</p>
            <h1 className="font-display text-[2.1rem] leading-[1.05] font-extrabold">{dateLine}</h1>
          </div>
          <Link to="/settings" className="icon-button" aria-label="Settings">
            <SettingsIcon size="size-5" />
          </Link>
        </header>

        <section className="card card-hero mb-4 p-4">
          <PipSpeech pose={today.kind === 'rest' ? 'sleep' : 'idle'} size={120} />
        </section>

        <div className="grid grid-cols-1 gap-3">
          <StatTiles streak={workoutStreak(sessions)} totals={totals} weight={weight} />
          <WeekStrip days={days} />
          {open.data && <OpenWorkoutBanner session={open.data} />}
        </div>
        <ErrorBanner error={open.error} onRetry={open.reload} />

        {!open.data && (
          <TodayLineup
            plan={today}
            exercises={plan.data?.exercises ?? []}
            todays={history.data?.todays ?? []}
            busy={creating || open.loading || plan.loading}
            error={startError}
            onCreate={create}
          />
        )}

        <Link to="/suggest" className="card pressable mt-4 flex items-center gap-3 p-4">
          <span className="icon-tile" style={{ background: 'var(--grad-accent)', color: 'white' }}>
            <SparkIcon />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block font-extrabold">Suggest a workout</span>
            <span className="block text-sm text-muted">Built from what you trained this week</span>
          </span>
          <ChevronIcon size="size-5" />
        </Link>
      </div>

      <section className="min-w-0">
        <div className="section-heading">
          <h2>Recent workouts</h2>
          <Link to="/history" className="text-link">
            See all
          </Link>
        </div>
        {recent.loading && !recent.data && <Loading rows={2} />}
        <ErrorBanner error={recent.error} onRetry={recent.reload} />
        {recent.data?.length === 0 && <p className="card card-pad text-sm text-muted">Your finished workouts will show up here.</p>}
        <div className="stagger grid grid-cols-1 gap-2.5">
          {recent.data?.map((item, i) => (
            <SessionListItem key={item.session.id} item={item} unit={unit} exerciseById={exerciseById} index={i} />
          ))}
        </div>
      </section>
    </div>
  )
}
