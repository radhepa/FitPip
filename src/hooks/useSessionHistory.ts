import { useState } from 'react'
import { listSessionSummaries, type SessionWithSets } from '../data/sessions'
import { errorMessage } from '../data/unwrap'
import { useAsync } from './useAsync'

const PAGE_SIZE = 15

/** Finished workouts, newest first: the first page loads on mount, more on demand. */
export function useSessionHistory() {
  const first = useAsync(() => listSessionSummaries(PAGE_SIZE), [])
  const [more, setMore] = useState<SessionWithSets[]>([])
  const [exhausted, setExhausted] = useState(false)
  const [busy, setBusy] = useState(false)
  const [moreError, setMoreError] = useState<string | null>(null)

  const items = first.data ? [...first.data, ...more] : null
  const hasMore = items !== null && !exhausted && items.length >= PAGE_SIZE

  async function loadMore() {
    const last = items?.at(-1)
    if (!last) return
    setBusy(true)
    setMoreError(null)
    try {
      const page = await listSessionSummaries(PAGE_SIZE, last.session.started_at)
      setMore((prev) => [...prev, ...page])
      setExhausted(page.length < PAGE_SIZE)
    } catch (e) {
      setMoreError(errorMessage(e))
    } finally {
      setBusy(false)
    }
  }

  return {
    items,
    hasMore,
    loading: first.loading,
    loadingMore: busy,
    error: first.error ?? moreError,
    loadMore,
    retry: first.reload,
  }
}
