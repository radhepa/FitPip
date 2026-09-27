import type { ReactNode } from 'react'
import type { Category } from '../types/db'

function Icon({ children, size = 'size-6', stroke = 1.9 }: { children: ReactNode; size?: string; stroke?: number }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  )
}

type P = { size?: string }

export const HomeIcon = ({ size }: P) => (
  <Icon size={size}>
    <path d="M3.5 10.5 12 3.5l8.5 7v9a1 1 0 0 1-1 1H15v-6H9v6H4.5a1 1 0 0 1-1-1z" />
  </Icon>
)

export const ChartIcon = ({ size }: P) => (
  <Icon size={size}>
    <path d="M4 19.5h16M6.5 16v-5M12 16V6M17.5 16v-8" />
  </Icon>
)

export const HistoryIcon = ({ size }: P) => (
  <Icon size={size}>
    <path d="M4.25 7.5A9 9 0 1 1 3 12M4.25 7.5V3.5m0 4h4" />
    <path d="M12 7v5l3.5 2" />
  </Icon>
)

export const SettingsIcon = ({ size }: P) => (
  <Icon size={size}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z" />
  </Icon>
)

export const CalendarIcon = ({ size }: P) => (
  <Icon size={size}>
    <rect x="3.5" y="5" width="17" height="15.5" rx="3" />
    <path d="M3.5 10h17M8 3v4M16 3v4" />
  </Icon>
)

export const ScaleIcon = ({ size }: P) => (
  <Icon size={size}>
    <rect x="3.5" y="3.5" width="17" height="17" rx="4.5" />
    <path d="M8 9a5 5 0 0 1 8 0" />
    <path d="m12 9.5 1.5-2" />
  </Icon>
)

export const BackIcon = ({ size }: P) => (
  <Icon size={size}>
    <path d="M15 5l-7 7 7 7" />
  </Icon>
)

export const ChevronIcon = ({ size }: P) => (
  <Icon size={size}>
    <path d="m9 5 7 7-7 7" />
  </Icon>
)

export const PlusIcon = ({ size = 'size-5' }: P) => (
  <Icon size={size} stroke={2.4}>
    <path d="M12 5v14M5 12h14" />
  </Icon>
)

export const CheckIcon = ({ size = 'size-5' }: P) => (
  <Icon size={size} stroke={2.6}>
    <path d="m5 12.5 4.5 4.5L19 7.5" />
  </Icon>
)

export const PlayIcon = ({ size = 'size-5' }: P) => (
  <svg viewBox="0 0 24 24" className={size} aria-hidden="true">
    <path fill="currentColor" d="M8 5.6v12.8a1 1 0 0 0 1.5.9l10.2-6.4a1 1 0 0 0 0-1.8L9.5 4.7A1 1 0 0 0 8 5.6Z" />
  </svg>
)

export const PauseIcon = ({ size = 'size-5' }: P) => (
  <svg viewBox="0 0 24 24" className={size} aria-hidden="true">
    <rect x="6" y="5" width="4" height="14" rx="1.2" fill="currentColor" />
    <rect x="14" y="5" width="4" height="14" rx="1.2" fill="currentColor" />
  </svg>
)

export const StopIcon = ({ size = 'size-5' }: P) => (
  <svg viewBox="0 0 24 24" className={size} aria-hidden="true">
    <rect x="6" y="6" width="12" height="12" rx="2.5" fill="currentColor" />
  </svg>
)

export const FlameIcon = ({ size = 'size-5' }: P) => (
  <svg viewBox="0 0 24 24" className={size} aria-hidden="true">
    <path fill="currentColor" d="M12.7 2.3c.5 3-1 4.7-2.4 6.3C8.9 10.2 7.5 11.8 7.5 14.5A4.5 4.5 0 0 0 12 19a4.5 4.5 0 0 0 4.5-4.5c0-1.2-.4-2.2-1-3.1.2 1.3-.3 2.5-1.4 2.9.5-2.6-.6-4.6-1.4-6.3 3.9 1.6 6.8 5 6.8 8.5a7.5 7.5 0 0 1-15 0c0-5.2 4.9-7.1 6.2-12.2Z" />
  </svg>
)

export const TimerIcon = ({ size }: P) => (
  <Icon size={size}>
    <circle cx="12" cy="13.5" r="7.5" />
    <path d="M12 9.5v4l2.5 1.5M9.5 2.5h5" />
  </Icon>
)

export const TrophyIcon = ({ size }: P) => (
  <Icon size={size}>
    <path d="M8 4h8v5a4 4 0 0 1-8 0zM8 6H4.5a3 3 0 0 0 3.5 4M16 6h3.5a3 3 0 0 1-3.5 4M12 13v4M8.5 20.5h7M9.5 17h5v3.5h-5z" />
  </Icon>
)

export const MedalIcon = ({ size }: P) => (
  <Icon size={size}>
    <path d="M8 3h8l-2.5 6.2M8 3l2.5 6.2" />
    <circle cx="12" cy="15" r="5.5" />
    <path d="m12 12.4.8 1.6 1.7.25-1.25 1.2.3 1.7-1.55-.8-1.55.8.3-1.7-1.25-1.2 1.7-.25z" />
  </Icon>
)

export const PencilIcon = ({ size = 'size-5' }: P) => (
  <Icon size={size}>
    <path d="M14.5 5.5l4 4M4 20l1-4.5L15.5 5a1.8 1.8 0 0 1 2.5 0l1 1a1.8 1.8 0 0 1 0 2.5L8.5 19z" />
  </Icon>
)

export const TrashIcon = ({ size = 'size-5' }: P) => (
  <Icon size={size}>
    <path d="M4 7h16M10 11v6M14 11v6M6 7l1 12.5a1.5 1.5 0 0 0 1.5 1.5h7a1.5 1.5 0 0 0 1.5-1.5L18 7M9 7V4.5h6V7" />
  </Icon>
)

export const CopyIcon = ({ size = 'size-5' }: P) => (
  <Icon size={size}>
    <rect x="8" y="8" width="12" height="12" rx="2.5" />
    <path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" />
  </Icon>
)

const STAR = 'M12 3.6l2.6 5.3 5.8.8-4.2 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.2-4.1 5.8-.8z'

/** Outline star, or a solid one when `filled` (a favourite workout). */
export const StarIcon = ({ size = 'size-5', filled = false }: P & { filled?: boolean }) =>
  filled ? (
    <svg viewBox="0 0 24 24" className={size} aria-hidden="true">
      <path d={STAR} fill="currentColor" stroke="currentColor" strokeWidth={1.4} strokeLinejoin="round" />
    </svg>
  ) : (
    <Icon size={size}>
      <path d={STAR} />
    </Icon>
  )

export const RepeatIcon = ({ size = 'size-5' }: P) => (
  <Icon size={size}>
    <path d="M17 3.5 20 6.5l-3 3M20 6.5H8a4 4 0 0 0-4 4V12M7 20.5 4 17.5l3-3M4 17.5h12a4 4 0 0 0 4-4V12" />
  </Icon>
)

export const ArrowUpIcon =({ size = 'size-5' }: P) => (
  <Icon size={size} stroke={2.2}>
    <path d="M12 19V5M6 11l6-6 6 6" />
  </Icon>
)

export const ArrowDownIcon = ({ size = 'size-5' }: P) => (
  <Icon size={size} stroke={2.2}>
    <path d="M12 5v14M6 13l6 6 6-6" />
  </Icon>
)

export const SparkIcon = ({ size = 'size-5' }: P) => (
  <svg viewBox="0 0 24 24" className={size} aria-hidden="true">
    <path fill="currentColor" d="M12 2.5c.6 4.7 2.8 6.9 7.5 7.5-4.7.6-6.9 2.8-7.5 7.5-.6-4.7-2.8-6.9-7.5-7.5 4.7-.6 6.9-2.8 7.5-7.5ZM19 15.5c.3 2 1.2 3 3 3.2-1.8.3-2.7 1.2-3 3.3-.3-2.1-1.2-3-3-3.3 1.8-.2 2.7-1.2 3-3.2Z" />
  </svg>
)

export const MoonIcon = ({ size }: P) => (
  <Icon size={size}>
    <path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5Z" />
  </Icon>
)

const CLOUD = 'M6.5 18.5a4.5 4.5 0 0 1-.5-8.97 6 6 0 0 1 11.6 1.47 3.75 3.75 0 0 1-.6 7.5Z'

/** Synced. */
export const CloudCheckIcon = ({ size }: P) => (
  <Icon size={size}>
    <path d={CLOUD} />
    <path d="m9.5 13.5 2 2 3.5-3.5" />
  </Icon>
)

/** Offline. */
export const CloudOffIcon = ({ size }: P) => (
  <Icon size={size}>
    <path d={CLOUD} />
    <path d="M4 4l16 16" />
  </Icon>
)

/** Syncing (spins when given the `animate-spin` class by its parent). */
export const SyncIcon = ({ size }: P) => (
  <Icon size={size}>
    <path d="M20 7.5A8.5 8.5 0 0 0 5.2 6M4 3.5V7h3.5M4 16.5A8.5 8.5 0 0 0 18.8 18M20 20.5V17h-3.5" />
  </Icon>
)

export const AlertIcon = ({ size }: P) => (
  <Icon size={size}>
    <path d="M12 4 3 19.5h18Z" />
    <path d="M12 10v4.5M12 17.5v.01" />
  </Icon>
)

// ---------------------------------------------------------------------------------------------
// One icon per kind of activity.

const DumbbellIcon = ({ size }: P) => (
  <Icon size={size} stroke={2}>
    <path d="M6.5 7v10M17.5 7v10M3.5 9.5v5M20.5 9.5v5M6.5 12h11" />
  </Icon>
)

const RunIcon = ({ size }: P) => (
  <Icon size={size} stroke={2}>
    <circle cx="14.5" cy="4.5" r="1.8" />
    <path d="m7 21 3-6 3 2.5V21M10 15l1.5-5.5 4 2.5 3 .5M8 10.5l3.5-1" />
  </Icon>
)

const SwimIcon = ({ size }: P) => (
  <Icon size={size} stroke={2}>
    <circle cx="16.5" cy="7" r="1.8" />
    <path d="m6 12 4-3.5 3 3 2-1.5M2.5 16c1.5 1.3 3 1.3 4.5 0s3-1.3 4.5 0 3 1.3 4.5 0 3-1.3 4.5 0M2.5 20c1.5 1.3 3 1.3 4.5 0s3-1.3 4.5 0 3 1.3 4.5 0 3-1.3 4.5 0" />
  </Icon>
)

const LotusIcon = ({ size }: P) => (
  <Icon size={size} stroke={1.9}>
    <path d="M12 19.5c-3-2-4.5-5-3.5-9 2 .8 3.5 2.5 3.5 5 0-2.5 1.5-4.2 3.5-5 1 4-.5 7-3.5 9Z" />
    <path d="M12 19.5c-4 .5-7.5-1-9-4.5 2-.5 4 0 5.5 1.3M12 19.5c4 .5 7.5-1 9-4.5-2-.5-4 0-5.5 1.3M12 9.5c-.6-2 0-4 0-6 0 2 .6 4 0 6" />
  </Icon>
)

const StretchIcon = ({ size }: P) => (
  <Icon size={size} stroke={2}>
    <circle cx="6" cy="5" r="1.8" />
    <path d="M6 8v6l-2.5 6.5M6 14l4 6.5M6 10.5l6-2 7.5-4.5" />
  </Icon>
)

const GloveIcon = ({ size }: P) => (
  <Icon size={size} stroke={1.9}>
    <path d="M7 13V8.5A4.5 4.5 0 0 1 11.5 4h2A4.5 4.5 0 0 1 18 8.5v4.5a4 4 0 0 1-4 4h-3a4 4 0 0 1-4-4Z" />
    <path d="M7 11.5h4.5a2 2 0 0 1 0 4H9M9.5 17v3.5h6V17" />
  </Icon>
)

const BallIcon = ({ size }: P) => (
  <Icon size={size} stroke={1.9}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M3.5 12h17M12 3.5c2.5 2.3 3.8 5.1 3.8 8.5s-1.3 6.2-3.8 8.5M12 3.5C9.5 5.8 8.2 8.6 8.2 12s1.3 6.2 3.8 8.5" />
  </Icon>
)

const CATEGORY_ICONS: Record<Category, (props: P) => ReactNode> = {
  strength: DumbbellIcon,
  cardio: RunIcon,
  swim: SwimIcon,
  yoga: LotusIcon,
  stretch: StretchIcon,
  combat: GloveIcon,
  sport: BallIcon,
}

export function CategoryIcon({ category, size }: { category: Category; size?: string }) {
  const Component = CATEGORY_ICONS[category] ?? DumbbellIcon
  return <Component size={size} />
}

export const PipHeadIcon = () => (
  <svg viewBox="0 0 24 24" className="size-7" aria-hidden="true">
    <path fill="currentColor" d="M4 8 3 3l5 2a9 9 0 0 1 8 0l5-2-1 5a9 9 0 1 1-16 0Z" />
    <path fill="var(--color-bg)" d="M7 9.5c1.8-2 3.1-2.4 5-1.5 1.9-.9 3.2-.5 5 1.5-.7 4-2.5 6-5 6s-4.3-2-5-6Z" />
    <path fill="var(--color-accent)" d="M6 6.5h12v2H6z" />
  </svg>
)
