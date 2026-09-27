import { lazy, type ComponentType } from 'react'

/**
 * Screens other than Today and sign-in load as separate chunks, so the app opens with less code to
 * parse. `preloadScreens()` fetches them all once the app is idle, so a tab tap never waits on the
 * network (the service worker has them cached too).
 */
const loaders: (() => Promise<unknown>)[] = []

function screen<K extends string, M extends Record<K, ComponentType>>(load: () => Promise<M>, name: K) {
  loaders.push(load)
  return lazy(() => load().then((m) => ({ default: m[name] })))
}

export const ExerciseDetailScreen = screen(() => import('./ExerciseDetailScreen'), 'ExerciseDetailScreen')
export const HistoryScreen = screen(() => import('./HistoryScreen'), 'HistoryScreen')
export const NotFoundScreen = screen(() => import('./NotFoundScreen'), 'NotFoundScreen')
export const PlanScreen = screen(() => import('./PlanScreen'), 'PlanScreen')
export const ProfileScreen = screen(() => import('./ProfileScreen'), 'ProfileScreen')
export const ProgressScreen = screen(() => import('./ProgressScreen'), 'ProgressScreen')
export const SessionDetailScreen = screen(() => import('./SessionDetailScreen'), 'SessionDetailScreen')
export const SettingsScreen = screen(() => import('./SettingsScreen'), 'SettingsScreen')
export const SuggestScreen = screen(() => import('./SuggestScreen'), 'SuggestScreen')
export const TemplateScreen = screen(() => import('./TemplateScreen'), 'TemplateScreen')
export const WeighInScreen = screen(() => import('./WeighInScreen'), 'WeighInScreen')
export const WelcomeScreen = screen(() => import('./WelcomeScreen'), 'WelcomeScreen')
export const WorkoutScreen = screen(() => import('./WorkoutScreen'), 'WorkoutScreen')

/** Loads every screen chunk in the background, a little after start-up. */
export function preloadScreens(): void {
  const run = () => loaders.forEach((load) => void load().catch(() => {}))
  // iOS Safari has no requestIdleCallback.
  if (typeof window.requestIdleCallback === 'function') window.requestIdleCallback(run, { timeout: 2500 })
  else setTimeout(run, 1200)
}
