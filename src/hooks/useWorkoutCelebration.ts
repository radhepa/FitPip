import { useEffect, useRef, useState } from 'react'
import type { PipCelebration } from '../config/pipCelebrations'
import { chooseCelebration, parseCelebrations, type CelebrationMemory } from '../lib/pip/celebrations'

const STORAGE_KEY = 'fitpip.pip-celebrations.v1'
// Private/restricted storage still gets a non-repeating rotation during this app visit.
let fallbackMemory: CelebrationMemory | null = null

function takeCelebration(sessionId: string, another = false) {
  let memory = fallbackMemory
  try { memory = parseCelebrations(localStorage.getItem(STORAGE_KEY)) ?? memory } catch { /* Use this visit's memory. */ }
  const next = chooseCelebration(memory, sessionId, another)
  fallbackMemory = next.memory
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next.memory)) } catch { /* The animation still works. */ }
  return next.celebration
}

/** Choose in an effect, never during render; remounting the same workout keeps its selection. */
export function useWorkoutCelebration(sessionId: string, enabled: boolean) {
  const [celebration, setCelebration] = useState<PipCelebration | null>(null)
  const chosenFor = useRef<string | null>(null)
  useEffect(() => {
    if (!enabled || chosenFor.current === sessionId) return
    chosenFor.current = sessionId
    setCelebration(takeCelebration(sessionId))
  }, [sessionId, enabled])
  return {
    celebration,
    another: () => { if (enabled) setCelebration(takeCelebration(sessionId, true)) },
  }
}
