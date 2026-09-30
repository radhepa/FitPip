import { describe, expect, it } from 'vitest'
import { finishedLate, forgottenSince } from './staleWorkout'

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

describe('finishedLate', () => {
  it('is the last set when the workout was finished hours after it', () => {
    const sets = [{ created_at: iso(12) }, { created_at: iso(11) }]
    expect(finishedLate({ started_at: iso(13), ended_at: iso(0) }, sets)).toBe(iso(11))
  })

  it('leaves a workout finished soon after its last set alone', () => {
    expect(finishedLate({ started_at: iso(2), ended_at: iso(0) }, [{ created_at: iso(0.5) }])).toBeNull()
  })

  it('ignores sets added after it finished, and needs a set inside it', () => {
    const late = [{ created_at: iso(11) }, { created_at: iso(-2) }]
    expect(finishedLate({ started_at: iso(12), ended_at: iso(0) }, late)).toBe(iso(11))
    expect(finishedLate({ started_at: iso(12), ended_at: iso(0) }, [{ created_at: iso(-2) }])).toBeNull()
  })

  it('leaves running and not-begun workouts alone', () => {
    expect(finishedLate({ started_at: iso(12), ended_at: null }, [{ created_at: iso(11) }])).toBeNull()
    expect(finishedLate({ started_at: null, ended_at: null }, [])).toBeNull()
  })
})
