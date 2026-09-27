import { useState } from 'react'
import { useNavigationType } from 'react-router-dom'
import { listSessionSummaries, type SessionWithSets } from '../data/sessions'
import { errorMessage } from '../data/unwrap'
import { useAsync } from './useAsync'

const PAGE_SIZE = 15

/**
 * How many workouts the list had loaded. Coming Back to the list (from a workout opened after "Load more")
 * loads that many again, so the list is as long as it was and the scroll position can be restored.
 */
let loadedCount = PAGE_SIZE

/** Finished workouts, newest first: the first page loads on mount, more on demand. */
export function useSessionHistory() {
  const navigation = useNavigationType()
  // Opened afresh (not Back), it starts again from one page.
  const [count] = useState(() => (navigation === 'POP' ? loadedCount : (loadedCount = PAGE_SIZE)))
  const first = useAsync(() => listSessionSummaries(count), [count], { cacheKey: `history:first:${count}` })
  const [more, setMore] = useState<SessionWithSets[]>([])
  const [exhausted, setExhausted] = useState(false)
  const [busy, setBusy] = useState(false)
  const [moreError, setMoreError] = useState<string | null>(null)

  const items = first.data ? [...first.data, ...more] : null
  const hasMore = items !== null && !exhausted && (first.data?.length ?? 0) >= count

  async function loadMore() {
    const last = items?.at(-1)
    if (!last) return
    setBusy(true)
    setMoreError(null)
    try {
      const page = await listSessionSummaries(PAGE_SIZE, last.session.started_at)
      setMore((prev) => [...prev, ...page])
      loadedCount = (items?.length ?? 0) + page.length
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
