import { listBodyWeights } from '../data/bodyWeights'
import { listExercises } from '../data/exercises'
import { getOpenSession, listSessionsSince, listSessionSummaries } from '../data/sessions'
import { listSetsForSessions } from '../data/sets'
import { listTemplates } from '../data/templates'
import { listWeekPlan } from '../data/weekPlan'
import type { BodyWeight, Exercise, TemplateWithItems, WeekPlanItem } from '../types/db'
import { useAsync } from './useAsync'

const STREAK_DAYS = 90

/** Resolves to a fallback instead of failing (e.g. a migration that has not been run yet). */
const orElse = async <T,>(load: Promise<T>, fallback: T): Promise<T> => {
  try {
    return await load
  } catch {
    return fallback
  }
}

/** Everything the Today screen shows, loaded in parallel. Parts that fail just show less. */
export function useTodayData() {
  const open = useAsync(getOpenSession, [], { cacheKey: 'today:open' })
  const recent = useAsync(() => listSessionSummaries(4), [], { cacheKey: 'today:recent' })
  const plan = useAsync(async () => {
    const [items, routines, exercises] = await Promise.all([
      orElse<WeekPlanItem[]>(listWeekPlan(), []),
      orElse<TemplateWithItems[]>(listTemplates(), []),
      orElse<Exercise[]>(listExercises(), []),
    ])
    return { items, routines, exercises }
  }, [], { cacheKey: 'today:plan' })
  const history = useAsync(async () => {
    const since = new Date()
    since.setHours(0, 0, 0, 0)
    since.setDate(since.getDate() - STREAK_DAYS)
    const sessions = await listSessionsSince(since.toISOString())
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todays = sessions.filter((s) => new Date(s.started_at) >= today)
    const sets = await listSetsForSessions(todays.map((s) => s.id))
    return { sessions, todays: todays.map((session) => ({ session, sets: sets.filter((set) => set.session_id === session.id) })) }
  }, [], { cacheKey: 'today:history' })
  const weights = useAsync(() => orElse<BodyWeight[]>(listBodyWeights(), []), [], { cacheKey: 'today:weights' })
  return { open, recent, plan, history, weights }
}
