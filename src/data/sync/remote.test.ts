import { describe, expect, it } from 'vitest'
import { failureFrom } from './remote'

const reply = (status: number, message = 'boom', code?: string) => ({ status, error: { message, code } })

describe('failureFrom', () => {
  it('treats a dropped connection as a network problem (retry, keep everything)', () => {
    expect(failureFrom(reply(0, 'TypeError: Failed to fetch')).kind).toBe('network')
    expect(failureFrom(reply(200, 'TypeError: Load failed')).kind).toBe('network')
  })

  it('treats an expired or missing sign-in as an auth problem, not as a bad row', () => {
    expect(failureFrom(reply(401, 'JWT expired', 'PGRST301')).kind).toBe('auth')
    expect(failureFrom(reply(401, 'permission denied for table sets', '42501')).kind).toBe('auth')
  })

  it('treats a busy or failing server as temporary', () => {
    for (const status of [408, 429, 500, 502, 503]) expect(failureFrom(reply(status)).kind).toBe('transient')
  })

  it('treats a refusal of the data itself as permanent', () => {
    expect(failureFrom(reply(409, 'duplicate key value', '23505')).kind).toBe('permanent')
    expect(failureFrom(reply(400, 'check constraint', '23514')).kind).toBe('permanent')
    expect(failureFrom(reply(403, 'new row violates row-level security policy', '42501')).kind).toBe('permanent')
  })

  it('tells the owner which migration to run when the database is missing a piece', () => {
    expect(failureFrom(reply(400, 'column exercises.modified_at does not exist', '42703')).message).toMatch(/20260927000100_offline_sync\.sql/)
    expect(failureFrom(reply(404, "Could not find the table 'public.deleted_rows' in the schema cache", 'PGRST205')).message).toMatch(/offline_sync/)
    expect(failureFrom(reply(400, "Could not find the 'category' column of 'week_plan_items' in the schema cache", 'PGRST204')).message).toMatch(/20260926000200_week_plan_categories\.sql/)
  })

  it('keeps the server code for the friendly-message lookup', () => {
    expect(failureFrom(reply(409, 'dup', '23505')).code).toBe('23505')
  })
})
