import { Outlet, useLocation } from 'react-router-dom'
import { SyncBanner } from './SyncBadge'
import { TabBar } from './TabBar'

/** Page frame for signed-in screens: safe-area padding, a page transition and the tab bar. */
export function AppShell() {
  const { pathname } = useLocation()
  return (
    <div className="app-shell">
      <main key={pathname} className="app-content page-enter">
        <SyncBanner />
        <Outlet />
      </main>
      <TabBar />
    </div>
  )
}
