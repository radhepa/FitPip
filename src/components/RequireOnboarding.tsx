import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { hasFinishedOnboarding } from '../data/onboarding'
import { useAsync } from '../hooks/useAsync'
import { ErrorBanner, Loading } from './feedback'

export function RequireOnboarding() {
  const location = useLocation()
  const { data: complete, loading, error, reload } = useAsync(hasFinishedOnboarding, [])
  if (error) return <main className="app-content"><ErrorBanner error={error} onRetry={reload} /></main>
  if (loading) return <Loading label="Getting things ready…" />
  if (!complete) return <Navigate to="/welcome" replace state={{ returnTo: location.pathname + location.search + location.hash }} />
  return <Outlet />
}
