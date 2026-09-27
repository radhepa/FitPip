import type { PostgrestError } from '@supabase/supabase-js'
import { describe, expect, it } from 'vitest'
import { assertOk, DataError, errorMessage, unwrap } from './unwrap'

const pgError = (code: string, message = 'raw postgres text') =>
  ({ code, message, details: '', hint: '', name: 'PostgrestError' }) as unknown as PostgrestError

describe('errorMessage', () => {
  it('turns known Postgres codes into friendly text', () => {
    expect(errorMessage(new DataError({ code: '23505', message: 'dup' }))).toBe('That already exists.')
    expect(errorMessage(new DataError({ code: '23001', message: 'restrict' }))).toMatch(/still in use/)
    expect(errorMessage(new DataError({ code: '23503', message: 'fk' }))).toMatch(/no longer exists/)
  })

  it('says the server is out of reach instead of the browser wording', () => {
    for (const raw of ['Failed to fetch', 'Load failed', 'NetworkError when attempting to fetch resource.']) {
      expect(errorMessage(new TypeError(raw))).toBe("Can't reach the server. Check your connection and try again.")
    }
    expect(errorMessage(new Error('Failed to fetch the moon'))).toBe('Failed to fetch the moon')
  })

  it('passes other messages through and survives odd values', () => {
    expect(errorMessage(new DataError({ code: '99999', message: 'boom' }))).toBe('boom')
    expect(errorMessage(new Error('plain'))).toBe('plain')
    expect(errorMessage('nope')).toBe('Something went wrong.')
  })
})

describe('unwrap / assertOk', () => {
  it('returns data or throws a DataError carrying the code', () => {
    expect(unwrap({ data: [1, 2], error: null })).toEqual([1, 2])
    expect(() => unwrap({ data: null, error: pgError('23505') })).toThrow(DataError)
    expect(() => assertOk({ error: pgError('23001') })).toThrow('raw postgres text')
    expect(() => assertOk({ error: null })).not.toThrow()
  })
})
