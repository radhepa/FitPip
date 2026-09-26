import { describe, expect, it } from 'vitest'
import { SETUP_CODES, classifyFailure, messageFor } from './suggestionErrors'

describe('classifyFailure', () => {
  it.each([
    [503, { error: 'not_configured' }, 'not_configured'],
    [502, { error: 'provider_auth' }, 'bad_key'],
    [402, { error: 'insufficient_credits' }, 'no_credits'],
    [429, { error: 'provider_rate_limited' }, 'rate_limited'],
    [504, { error: 'provider_timeout' }, 'timeout'],
    [401, { error: 'unauthorized' }, 'unauthorized'],
    [422, { error: 'empty_bank' }, 'empty_bank'],
    [502, { error: 'invalid_model_output' }, 'model_failed'],
  ])('maps %i %j to %s', (status, body, code) => {
    expect(classifyFailure(status, body).code).toBe(code)
  })

  it("treats the Supabase gateway's not-found as a function that has not been deployed", () => {
    expect(classifyFailure(404, { code: 'NOT_FOUND', message: 'Requested function was not found' }).code).toBe('not_deployed')
  })

  it('falls back on the status when the body is not ours', () => {
    expect(classifyFailure(401, null).code).toBe('unauthorized')
    expect(classifyFailure(429, 'slow down').code).toBe('rate_limited')
    expect(classifyFailure(500, { error: 'internal_error' }).code).toBe('failed')
    expect(classifyFailure(500, undefined).code).toBe('failed')
  })

  it('gives every failure a readable message', () => {
    expect(classifyFailure(503, { error: 'not_configured' }).message).toMatch(/OpenRouter API key/)
    expect(messageFor('guest')).toMatch(/account/)
  })

  it('marks the owner-fixable ones as setup problems', () => {
    expect(SETUP_CODES).toEqual(expect.arrayContaining(['not_deployed', 'not_configured', 'bad_key', 'no_credits']))
    expect(SETUP_CODES).not.toContain('rate_limited')
  })
})
