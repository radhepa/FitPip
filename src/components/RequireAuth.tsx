import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { Loading } from './feedback'

export function RequireAuth() {
  const { session, loading } = useAuth()
  if (loading) return <Loading />
  if (!session) return <Navigate to="/login" replace />
  return <Outlet />
}
