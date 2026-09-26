// Tiny publish/subscribe used by the local store and the sync engine. Kept free of React and of
// Supabase so both the data layer and the sync layer can import it without a cycle.

type Listener = () => void

let dataVersion = 0
const dataListeners = new Set<Listener>()
const writeListeners = new Set<Listener>()

let channel: BroadcastChannel | null | undefined
/** Other tabs of the app (same origin) hear about writes so they refresh too. Browser only. */
function tabChannel(): BroadcastChannel | null {
  if (channel !== undefined) return channel
  channel = typeof window !== 'undefined' && typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('fitpip-data') : null
  channel?.addEventListener('message', (event) => {
    if (event.data === 'write') {
      bumpDataVersion()
      emitLocalWrite(false)
    } else if (event.data === 'remote') {
      bumpDataVersion()
    }
  })
  return channel
}

/** Counts up whenever data changed from outside the current screen (a sync, another tab). */
export const getDataVersion = () => dataVersion

export function subscribeDataVersion(listener: Listener): () => void {
  tabChannel()
  dataListeners.add(listener)
  return () => dataListeners.delete(listener)
}

export function bumpDataVersion(): void {
  dataVersion += 1
  dataListeners.forEach((listener) => listener())
}

/** Called after every local write so a sync can be scheduled and the pending count refreshed. */
export function emitLocalWrite(broadcast = true): void {
  writeListeners.forEach((listener) => listener())
  if (broadcast) tabChannel()?.postMessage('write')
}

export function onLocalWrite(listener: Listener): () => void {
  writeListeners.add(listener)
  return () => writeListeners.delete(listener)
}

/** A sync brought in changes from the server: screens should reload what they show. */
export function announceRemoteChange(): void {
  bumpDataVersion()
  tabChannel()?.postMessage('remote')
}
