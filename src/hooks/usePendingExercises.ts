import { useCallback, useState } from 'react'

const key = (sessionId: string) => `gym.pending.${sessionId}`

function read(sessionId: string): string[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(key(sessionId)) ?? '[]')
    return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === 'string') : []
  } catch {
    return []
  }
}

function write(sessionId: string, ids: string[]) {
  try {
    if (ids.length === 0) localStorage.removeItem(key(sessionId))
    else localStorage.setItem(key(sessionId), JSON.stringify(ids))
  } catch {
    // storage unavailable: the list just won't survive a reload
  }
}

/**
 * Exercises added to a workout before their first set is logged. Sets are what
 * persist in the database, so this keeps the empty cards across an iOS app reload.
 */
export function usePendingExercises(sessionId: string) {
  const [ids, setIds] = useState<string[]>(() => read(sessionId))

  const update = useCallback(
    (fn: (prev: string[]) => string[]) =>
      setIds((prev) => {
        const next = fn(prev)
        write(sessionId, next)
        return next
      }),
    [sessionId],
  )

  const add = useCallback(
    (exerciseId: string) => update((prev) => (prev.includes(exerciseId) ? prev : [...prev, exerciseId])),
    [update],
  )
  const remove = useCallback((exerciseId: string) => update((prev) => prev.filter((id) => id !== exerciseId)), [update])
  const clear = useCallback(() => update(() => []), [update])

  return { ids, add, remove, clear }
}
