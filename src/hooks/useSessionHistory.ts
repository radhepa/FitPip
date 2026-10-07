import { useState } from 'react'
import { useNavigationType } from 'react-router-dom'
import { listSessionSummaries } from '../data/sessions'
import { useAsync } from './useAsync'

const PAGE_SIZE = 15

/**
 * How many workouts the list had loaded. Coming Back to the list (from a workout opened after "Load more")
 * loads that many again, so the list is as long as it was and the scroll position can be restored.
 */
let loadedCount = PAGE_SIZE

/**
 * Finished workouts, newest first: one page on mount, more on demand. The whole list is one read of
 * however many are shown, so when a sync adds or removes a workout the list is read again in one piece
 * (reading only the first page again would drop or repeat workouts at the page edges).
 */
export function useSessionHistory() {
  const navigation = useNavigationType()
  // Opened afresh (not Back), it starts again from one page.
  const [limit, setLimit] = useState(() => (navigation === 'POP' ? loadedCount : (loadedCount = PAGE_SIZE)))
  const list = useAsync(async () => ({ limit, items: await listSessionSummaries(limit) }), [limit], { cacheKey: `history:${limit}` })

  const loaded = list.data
  const items = loaded?.items ?? null
  // While more are being read, the list so far stays on screen.
  const loadingMore = loaded !== null && loaded.limit !== limit && !list.error
  const hasMore = loaded !== null && loaded.items.length >= loaded.limit

  function loadMore() {
    if (!loaded || loadingMore) return
    const next = loaded.items.length + PAGE_SIZE
    loadedCount = next
    setLimit(next)
  }

  return {
    items,
    hasMore,
    loading: list.loading,
    loadingMore,
    error: list.error,
    loadMore,
    retry: list.reload,
  }
}
