import { describe, expect, it } from 'vitest'
import { parseRecoveryHash } from './recoveryLink'

describe('parseRecoveryHash', () => {
  it('reads the tokens from a reset link', () => {
    expect(parseRecoveryHash('#access_token=a.b.c&expires_in=3600&refresh_token=r1&token_type=bearer&type=recovery')).toEqual({ kind: 'tokens', accessToken: 'a.b.c', refreshToken: 'r1' })
  })

  it('explains an expired or failed link', () => {
    expect(parseRecoveryHash('#error=access_denied&error_code=otp_expired&error_description=Email+link+is+invalid+or+has+expired')).toEqual({
      kind: 'error',
      message: 'This reset link has expired or was already used. Ask for a new one from the sign-in screen.',
    })
    expect(parseRecoveryHash('#error=server_error&error_description=Something+broke')).toEqual({ kind: 'error', message: 'Something broke' })
  })

  it('ignores anything else', () => {
    expect(parseRecoveryHash('')).toBeNull()
    expect(parseRecoveryHash('#access_token=a&refresh_token=r&type=signup')).toBeNull()
    expect(parseRecoveryHash('#section-2')).toBeNull()
  })
})
