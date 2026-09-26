import { useEffect, useRef, useState } from 'react'
import { lastSessionSetsForExercise } from '../data/sets'
import type { SetRow } from '../types/db'

/**
 * For each exercise, the sets from the last earlier workout that included it. Used to prefill the
 * first set's weight and to show "last time". Fetched once per exercise.
 */
export function useLastSessionSets(exerciseIds: string[], sessionId: string): Record<string, SetRow[]> {
  const [last, setLast] = useState<Record<string, SetRow[]>>({})
  const requested = useRef(new Set<string>())
  const idsKey = exerciseIds.join(',')

  useEffect(() => {
    for (const id of exerciseIds) {
      if (requested.current.has(id)) continue
      requested.current.add(id)
      lastSessionSetsForExercise(id, sessionId)
        .then((sets) => setLast((prev) => ({ ...prev, [id]: sets })))
        .catch(() => setLast((prev) => ({ ...prev, [id]: [] })))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idsKey, sessionId])

  return last
}
