import { useCallback, useEffect, useRef, useState, type DependencyList } from 'react'
import { useDataVersion } from './useSyncStatus'

export interface AsyncState<T> {
  data: T | null
  setData: (data: T | null | ((prev: T | null) => T | null)) => void
  error: Error | null
  /** True only until the first result arrives; reloads keep showing the old data. */
  loading: boolean
  reload: () => void
}

/**
 * Runs an async loader whenever `deps` change and exposes its result. It also reloads (keeping the
 * old data on screen) when a sync brings in changes from another device.
 */
export function useAsync<T>(load: () => Promise<T>, deps: DependencyList): AsyncState<T> {
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState<Error | null>(null)
  const [loading, setLoading] = useState(true)
  const [tick, setTick] = useState(0)
  const dataVersion = useDataVersion()
  const loadRef = useRef(load)
  loadRef.current = load

  useEffect(() => {
    let cancelled = false
    loadRef
      .current()
      .then((result) => {
        if (cancelled) return
        setData(result)
        setError(null)
      })
      .catch((e: unknown) => {
        if (!cancelled) setError(e instanceof Error ? e : new Error(String(e)))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick, dataVersion])

  const reload = useCallback(() => setTick((t) => t + 1), [])
  return { data, setData, error, loading, reload }
}
