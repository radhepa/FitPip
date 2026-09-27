// The password-reset email links back to the app with the result in the URL hash, e.g.
// #access_token=...&refresh_token=...&type=recovery, or #error=access_denied&error_code=otp_expired&...

export type RecoveryLink = { kind: 'tokens'; accessToken: string; refreshToken: string } | { kind: 'error'; message: string }

/** What a reset link carries, or null when the hash is not from one. */
export function parseRecoveryHash(hash: string): RecoveryLink | null {
  const params = new URLSearchParams(hash.replace(/^#/, ''))
  const code = params.get('error_code') ?? params.get('error')
  if (code) {
    const message =
      code === 'otp_expired'
        ? 'This reset link has expired or was already used. Ask for a new one from the sign-in screen.'
        : params.get('error_description')?.replace(/\+/g, ' ') || 'That reset link did not work. Ask for a new one from the sign-in screen.'
    return { kind: 'error', message }
  }
  const accessToken = params.get('access_token')
  const refreshToken = params.get('refresh_token')
  if (params.get('type') === 'recovery' && accessToken && refreshToken) return { kind: 'tokens', accessToken, refreshToken }
  return null
}
