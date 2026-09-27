import { useCallback, useState } from 'react'

const PREFIX = 'fitpip.running.'

function read<T>(key: string | undefined, fallback: T, isValid: (value: unknown) => value is T): T {
  if (!key) return fallback
  try {
    const raw = localStorage.getItem(PREFIX + key)
    if (raw === null) return fallback
    const value: unknown = JSON.parse(raw)
    return isValid(value) ? value : fallback
  } catch {
    return fallback
  }
}

/**
 * State that survives leaving the screen or the phone closing the app (a stopwatch or countdown that
 * is running). Kept on this device only; `rest` (the idle value) is never stored. Without a key it is
 * plain state. Writes happen in the setter itself, so a remount right after never sees a stale value.
 */
export function useStoredState<T>(key: string | undefined, rest: T, isValid: (value: unknown) => value is T): [T, (next: T) => void] {
  const [value, setValue] = useState<T>(() => read(key, rest, isValid))
  const set = useCallback(
    (next: T) => {
      setValue(next)
      if (!key) return
      try {
        if (JSON.stringify(next) === JSON.stringify(rest)) localStorage.removeItem(PREFIX + key)
        else localStorage.setItem(PREFIX + key, JSON.stringify(next))
      } catch {
        // storage blocked or full: it just won't survive a restart
      }
    },
    // `rest` is a constant at every call site
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [key],
  )
  return [value, set]
}
