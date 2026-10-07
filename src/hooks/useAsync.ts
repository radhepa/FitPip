import { useCallback, useEffect, useRef, useState, type DependencyList } from 'react'
import { getDataGeneration } from '../data/local/events'
import { peekRead, rememberRead } from '../data/local/readCache'
import { sameData } from '../lib/sameData'
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
  const [data, setDataState] = useState<T | null>(initial ? initial.value : null)
  const [error, setError] = useState<Error | null>(null)
  const [loading, setLoading] = useState(!initial)
  const [tick, setTick] = useState(0)
  const dataVersion = useDataVersion()
  const loadRef = useRef(load)
  loadRef.current = load
  const lastTick = useRef(tick)
  /** What is on screen, so a re-read that brings back the same data can keep it (and skip a redraw). */
  const shown = useRef<T | null>(data)
  const setData = useCallback((next: T | null | ((prev: T | null) => T | null)) => {
    setDataState((prev) => {
      const value = typeof next === 'function' ? (next as (prev: T | null) => T | null)(prev) : next
      shown.current = value
      return value
    })
  }, [])

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
    // A change saved on this device while the read ran (the screen usually shows it already) would be
    // undone by the older result, so that result is dropped and the data read again, once.
    const read = (retries: number) => {
      const generation = getDataGeneration()
      loadRef
        .current()
        .then((result) => {
          if (cancelled) return
          if (retries > 0 && getDataGeneration() !== generation) return read(retries - 1)
          // Same data as on screen: keep the old copy, so nothing worked out from it is built again.
          const kept = sameData(shown.current, result) ? (shown.current as T) : result
          if (cacheKey) rememberRead(cacheKey, kept, generation)
          if (kept !== shown.current) setData(kept)
          setError(null)
          setLoading(false)
        })
        .catch((e: unknown) => {
          if (cancelled) return
          setError(e instanceof Error ? e : new Error(String(e)))
          setLoading(false)
        })
    }
    read(1)
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick, dataVersion, cacheKey])

  const reload = useCallback(() => setTick((t) => t + 1), [])
  return { data, setData, error, loading, reload }
}
