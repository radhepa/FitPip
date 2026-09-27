import { createElement, lazy, useState, type ComponentType } from 'react'

/**
 * Screens other than Today and sign-in load as separate chunks, so the app opens with less code to
 * parse. `preloadScreens()` fetches them all once the app is idle, so a tab tap never waits on the
 * network (the service worker has them cached too).
 */
const loaders: (() => Promise<unknown>)[] = []

/**
 * A screen from its own chunk. Once the chunk is in, the screen renders straight away. (A plain
 * React.lazy suspends on its first render even when the code is already loaded, and React then holds
 * the page blank for ~300 ms: that was the empty flash on the first visit to every tab.)
 */
function screen<K extends string, M extends Record<K, ComponentType>>(load: () => Promise<M>, name: K): ComponentType {
  let loaded: ComponentType | null = null
  const fetchScreen = () =>
    load().then((m) => {
      loaded = m[name]
      return m
    })
  const Lazy: ComponentType = lazy(() => fetchScreen().then((m) => ({ default: m[name] as ComponentType })))
  loaders.push(fetchScreen)

  function Screen() {
    // Chosen once per visit, so a screen that started out lazy is never swapped (and reset) mid-visit.
    const [ready] = useState(() => loaded)
    return createElement(ready ?? Lazy)
  }
  Screen.displayName = name
  return Screen
}

export const ExerciseDetailScreen = screen(() => import('./ExerciseDetailScreen'), 'ExerciseDetailScreen')
export const HistoryScreen = screen(() => import('./HistoryScreen'), 'HistoryScreen')
export const NotFoundScreen = screen(() => import('./NotFoundScreen'), 'NotFoundScreen')
export const PlanScreen = screen(() => import('./PlanScreen'), 'PlanScreen')
export const ProfileScreen = screen(() => import('./ProfileScreen'), 'ProfileScreen')
export const ProgressScreen = screen(() => import('./ProgressScreen'), 'ProgressScreen')
export const ResetPasswordScreen = screen(() => import('./ResetPasswordScreen'), 'ResetPasswordScreen')
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
