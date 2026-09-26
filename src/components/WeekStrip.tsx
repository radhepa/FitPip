import { Link } from 'react-router-dom'
import type { DayStatus } from '../lib/homeStats'
import { CheckIcon } from './icons'

const LETTERS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

/** This week at a glance: a check for days trained, a ring for today, a dot for planned days. */
export function WeekStrip({ days }: { days: DayStatus[] }) {
  return (
    <Link to="/plan" className="card pressable flex items-center justify-between gap-1 px-3 py-3" aria-label="This week. Open the plan.">
      {days.map((day) => {
        const base = 'grid size-9 place-items-center rounded-full text-sm font-extrabold transition-colors'
        const look = day.done
          ? 'text-on-accent'
          : day.isToday
            ? 'border-2 border-accent text-accent'
            : day.planned
              ? 'bg-surface-2 text-text'
              : 'text-muted'
        return (
          <div key={day.weekday} className="flex flex-col items-center gap-1.5">
            <span className={`text-[.7rem] font-bold ${day.isToday ? 'text-accent' : 'text-muted'}`}>{LETTERS[day.weekday]}</span>
            <span
              className={`${base} ${look}`}
              style={day.done ? { background: 'var(--grad-accent)', boxShadow: 'var(--glow)' } : undefined}
              aria-label={`${day.date.toLocaleDateString(undefined, { weekday: 'long' })}${day.done ? ', trained' : day.planned ? ', planned' : ''}`}>
              {day.done ? <CheckIcon size="size-4" /> : day.date.getDate()}
            </span>
            <span className={`size-1.5 rounded-full ${day.planned && !day.done ? 'bg-accent' : 'bg-transparent'}`} aria-hidden="true" />
          </div>
        )
      })}
    </Link>
  )
}
