import { Suspense } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { useScrollMemory } from '../hooks/useScrollMemory'
import { SyncBanner } from './SyncBadge'
import { TabBar } from './TabBar'

/** Page frame for signed-in screens: safe-area padding, a page transition and the tab bar. */
export function AppShell() {
  const { pathname } = useLocation()
  useScrollMemory()
  return (
    <div className="app-shell">
      <main key={pathname} className="app-content page-enter">
        <SyncBanner />
        {/* Keeps the tab bar up if a screen's code is still loading on a cold start. */}
        <Suspense fallback={null}>
          <Outlet />
        </Suspense>
      </main>
      <TabBar />
    </div>
  )
}
