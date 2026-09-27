import { useEffect, useRef, useState } from 'react'
import { listSetsForExercise } from '../data/sets'
import type { SetRow } from '../types/db'

/**
 * For each exercise, its sets from workouts that began before this one (to spot personal records as
 * they happen). Fetched once per exercise; `before` is this workout's start time.
 */
export function useEarlierSets(exerciseIds: string[], sessionId: string, before: string | null): Record<string, SetRow[]> {
  const [earlier, setEarlier] = useState<Record<string, SetRow[]>>({})
  const requested = useRef(new Set<string>())
  const idsKey = exerciseIds.join(',')

  useEffect(() => {
    for (const id of exerciseIds) {
      if (requested.current.has(id)) continue
      requested.current.add(id)
      listSetsForExercise(id)
        .then((sets) => sets.filter((s) => s.session.id !== sessionId && (before === null || s.session.started_at < before)))
        .then((sets) => setEarlier((prev) => ({ ...prev, [id]: sets })))
        .catch(() => setEarlier((prev) => ({ ...prev, [id]: [] })))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idsKey, sessionId, before])

  return earlier
}
