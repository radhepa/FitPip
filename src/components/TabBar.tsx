import type { CSSProperties, ReactNode } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { brand } from '../config/brand'
import { reduceMotion } from './fx'
import { CalendarIcon, ChartIcon, HistoryIcon, HomeIcon, MedalIcon, PipHeadIcon, ScaleIcon } from './icons'

const TABS: { to: string; label: string; icon: ReactNode; end?: boolean; match: RegExp }[] = [
  { to: '/', label: 'Today', icon: <HomeIcon />, end: true, match: /^\/($|workout|session|settings|suggest)/ },
  { to: '/plan', label: 'Plan', icon: <CalendarIcon />, match: /^\/plan/ },
  { to: '/weigh-in', label: 'Weigh-in', icon: <ScaleIcon />, match: /^\/weigh-in/ },
  { to: '/progress', label: 'Progress', icon: <ChartIcon />, match: /^\/(progress|exercises)/ },
  { to: '/history', label: 'History', icon: <HistoryIcon />, match: /^\/history/ },
  { to: '/profile', label: 'Profile', icon: <MedalIcon />, match: /^\/profile/ },
]

/** Floating tab bar with a highlight that slides to the active tab. */
export function TabBar() {
  const { pathname } = useLocation()
  const active = TABS.findIndex((tab) => tab.match.test(pathname))
  const style = { '--tabs': TABS.length, '--active': Math.max(0, active) } as CSSProperties

  return (
    <nav className="tab-bar" aria-label="Main navigation">
      <div className="tab-brand" aria-hidden="true">
        <PipHeadIcon />
        <strong>{brand.shortName}</strong>
      </div>
      <ul style={style}>
        <li className="tab-indicator" style={{ opacity: active < 0 ? 0 : 1 }} aria-hidden="true" />
        {TABS.map((tab) => (
          <li key={tab.to}>
            <NavLink
              to={tab.to}
              end={tab.end}
              className={() => `tab-link ${TABS[active]?.to === tab.to ? 'tab-link--active' : ''}`}
              aria-current={TABS[active]?.to === tab.to ? 'page' : undefined}
              onClick={() => {
                // Tapping the tab you are already on takes you back to the top, like a native app.
                if (pathname === tab.to) window.scrollTo({ top: 0, behavior: reduceMotion() ? 'auto' : 'smooth' })
              }}
            >
              <span className="tab-icon">{tab.icon}</span>
              <span>{tab.label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
