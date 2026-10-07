import { listBodyWeights } from '../data/bodyWeights'
import { listExercises } from '../data/exercises'
import { getOpenSession, listSessionsSince, listSessionSummaries } from '../data/sessions'
import { listSetsForSessions } from '../data/sets'
import { listTemplates } from '../data/templates'
import { listWeekPlan } from '../data/weekPlan'
import type { BodyWeight, Exercise, TemplateWithItems, WeekPlanItem } from '../types/db'
import { useAsync } from './useAsync'

/** Resolves to a fallback instead of failing (e.g. a migration that has not been run yet). */
const orElse = async <T,>(load: Promise<T>, fallback: T): Promise<T> => {
  try {
    return await load
  } catch {
    return fallback
  }
}

/**
 * Everything the Today screen shows, loaded in parallel. Parts that fail just show less. `day` (today's
 * date) reloads what depends on the date when it changes.
 */
export function useTodayData(day: string) {
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
    // Every begun workout (the rows only, no sets): the week streak can run back a long way.
    const sessions = await listSessionsSince('')
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todays = sessions.filter((s) => new Date(s.started_at) >= today)
    const sets = await listSetsForSessions(todays.map((s) => s.id))
    return { sessions, todays: todays.map((session) => ({ session, sets: sets.filter((set) => set.session_id === session.id) })) }
  }, [day], { cacheKey: 'today:history' })
  const weights = useAsync(() => orElse<BodyWeight[]>(listBodyWeights(), []), [], { cacheKey: 'today:weights' })
  return { open, recent, plan, history, weights }
}
