import { describe, expect, it } from 'vitest'
import { forgottenSince } from './staleWorkout'

const now = new Date('2026-09-27T20:00:00Z')
const iso = (hoursAgo: number) => new Date(now.getTime() - hoursAgo * 3_600_000).toISOString()

describe('forgottenSince', () => {
  it('is the last set once nothing has been logged for over 3 hours', () => {
    const sets = [{ created_at: iso(5) }, { created_at: iso(4) }]
    expect(forgottenSince({ started_at: iso(6), ended_at: null }, sets, now)).toBe(iso(4))
  })

  it('uses the start when nothing was logged', () => {
    expect(forgottenSince({ started_at: iso(3.5), ended_at: null }, [], now)).toBe(iso(3.5))
  })

  it('leaves a workout that is still going, finished or not begun alone', () => {
    expect(forgottenSince({ started_at: iso(5), ended_at: null }, [{ created_at: iso(1) }], now)).toBeNull()
    expect(forgottenSince({ started_at: iso(5), ended_at: iso(4) }, [], now)).toBeNull()
    expect(forgottenSince({ started_at: null, ended_at: null }, [], now)).toBeNull()
  })
})
