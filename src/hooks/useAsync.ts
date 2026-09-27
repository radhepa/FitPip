import { useCallback, useEffect, useRef, useState, type DependencyList } from 'react'
import { getDataGeneration } from '../data/local/events'
import { peekRead, rememberRead } from '../data/local/readCache'
import { useDataVersion } from './useSyncStatus'

export interface AsyncState<T> {
  data: T | null
  setData: (data: T | null | ((prev: T | null) => T | null)) => void
  error: Error | null
  /** True only until the first result arrives; reloads keep showing the old data. */
  loading: boolean
  reload: () => void
}

export interface AsyncOptions {
  /**
   * Remember the result under this key (include anything the load depends on, e.g. an id). Coming
   * back to the screen then shows it straight away while nothing on the device has changed, instead
   * of an empty page while the same data is read again. The same key must always mean the same load.
   */
  cacheKey?: string
}

/** A remembered read younger than this is shown as it is; an older one is shown and read again. */
const FRESH_MS = 30_000

/**
 * Runs an async loader whenever `deps` change and exposes its result. It also reloads (keeping the
 * old data on screen) when a sync brings in changes from another device.
 */
export function useAsync<T>(load: () => Promise<T>, deps: DependencyList, options: AsyncOptions = {}): AsyncState<T> {
  const { cacheKey } = options
  const [initial] = useState(() => (cacheKey ? peekRead<T>(cacheKey) : undefined))
  const [data, setData] = useState<T | null>(initial ? initial.value : null)
  const [error, setError] = useState<Error | null>(null)
  const [loading, setLoading] = useState(!initial)
  const [tick, setTick] = useState(0)
  const dataVersion = useDataVersion()
  const loadRef = useRef(load)
  loadRef.current = load
  const lastTick = useRef(tick)

  useEffect(() => {
    let cancelled = false
    // reload() always reads again; otherwise an exact remembered result can stand in for the read.
    const forced = lastTick.current !== tick
    lastTick.current = tick
    const hit = cacheKey && !forced ? peekRead<T>(cacheKey) : undefined
    if (hit) {
      setData(hit.value)
      setError(null)
      setLoading(false)
      if (hit.age < FRESH_MS) return
    }
    const generation = getDataGeneration()
    loadRef
      .current()
      .then((result) => {
        if (cacheKey) rememberRead(cacheKey, result, generation)
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
  }, [...deps, tick, dataVersion, cacheKey])

  const reload = useCallback(() => setTick((t) => t + 1), [])
  return { data, setData, error, loading, reload }
}
