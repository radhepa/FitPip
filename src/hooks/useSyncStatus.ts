import { useSyncExternalStore } from 'react'
import { getDataVersion, subscribeDataVersion } from '../data/local/events'
import { getSyncStatus, subscribeSyncStatus, type SyncStatus } from '../data/sync/status'

export const useSyncStatus = (): SyncStatus => useSyncExternalStore(subscribeSyncStatus, getSyncStatus)

/** Changes whenever a sync (or another tab) altered the data on this device. */
export const useDataVersion = (): number => useSyncExternalStore(subscribeDataVersion, getDataVersion)
