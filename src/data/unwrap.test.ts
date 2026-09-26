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
