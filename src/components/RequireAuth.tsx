import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useSyncStatus } from '../hooks/useSyncStatus'
import { FirstSyncScreen } from './FirstSyncScreen'
import { Loading } from './feedback'

export function RequireAuth() {
  const { session, loading } = useAuth()
  const sync = useSyncStatus()
  if (loading) return <Loading />
  if (!session) return <Navigate to="/login" replace />
  // A signed-in device needs one full download before it can run from its own copy of the data.
  if (!session.guest && !sync.initialSyncDone) return <FirstSyncScreen />
  return <Outlet />
}
