import type { Session as SupabaseSession } from '@supabase/supabase-js'
import { isConfigured, supabase } from '../lib/supabase'
import { GUEST_USER_ID, isGuestMode, setGuestMode } from './guest'

/** Who is using the app. `offline` means the sign-in could not be checked with the server just now. */
export interface AuthSession {
  user: { id: string; email?: string }
  guest?: boolean
  offline?: boolean
}

const LAST_USER_KEY = 'fitpip.last-user'

const guestSession = (): AuthSession => ({ guest: true, user: { id: GUEST_USER_ID, email: 'guest@fitpip.local' } })

function rememberUser(user: AuthSession['user']): void {
  try {
    localStorage.setItem(LAST_USER_KEY, JSON.stringify(user))
  } catch {
    // Not fatal: only used to open the app without a connection.
  }
}

function lastUser(): AuthSession['user'] | null {
  try {
    const raw = localStorage.getItem(LAST_USER_KEY)
    const user = raw ? (JSON.parse(raw) as AuthSession['user']) : null
    return user && typeof user.id === 'string' ? user : null
  } catch {
    return null
  }
}

function forgetUser(): void {
  try {
    localStorage.removeItem(LAST_USER_KEY)
  } catch {
    // ignore
  }
}

/**
 * The stored sign-in expires after an hour and is renewed over the network. Without a connection
 * that renewal fails, and the app must still open (the whole point is working offline), so a
 * failed check falls back to the last user who signed in on this device. An explicit sign-out
 * (or a refused renewal, which Supabase reports as a sign-out) clears that.
 */
function resolve(session: SupabaseSession | null, event?: string): AuthSession | null {
  if (session) {
    const user = { id: session.user.id, email: session.user.email }
    rememberUser(user)
    return { user }
  }
  if (event === 'SIGNED_OUT') {
    forgetUser()
    return null
  }
  const user = lastUser()
  return user ? { user, offline: true } : null
}

/** How long to wait for the server to confirm the stored sign-in before opening the app without it. */
const SESSION_CHECK_MS = 2_500

export async function getAuthSession(): Promise<AuthSession | null> {
  if (isGuestMode()) return guestSession()
  // Offline the check can't succeed, and Supabase keeps retrying the renewal for about 30 seconds.
  // Never make someone stare at a spinner for that: open the app as the last user straight away.
  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    const user = lastUser()
    if (user) return { user, offline: true }
  }
  let session: SupabaseSession | null = null
  try {
    const check = supabase.auth.getSession().then(({ data }) => data.session)
    const giveUp = new Promise<null>((resolve) => setTimeout(() => resolve(null), SESSION_CHECK_MS))
    session = await Promise.race([check, giveUp])
  } catch {
    // Offline: fall back to the remembered user below.
  }
  return resolve(session)
}

export function onAuthChange(callback: (session: AuthSession | null) => void): () => void {
  const { data } = supabase.auth.onAuthStateChange((event, session) => {
    if (isGuestMode()) return // guest mode ignores the server's view of who is signed in
    callback(resolve(session, event))
  })
  const onGuestChange = () => callback(isGuestMode() ? guestSession() : null)
  window.addEventListener('fitpip-auth-change', onGuestChange)
  return () => {
    data.subscription.unsubscribe()
    window.removeEventListener('fitpip-auth-change', onGuestChange)
  }
}

export async function signIn(email: string, password: string): Promise<void> {
  if (!isConfigured) throw new Error('Account sign-in is not configured yet. Continue as guest to explore the app.')
  setGuestMode(false)
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
}

/** Returns true when Supabase wants the email confirmed before the user can sign in. */
export async function signUp(email: string, password: string): Promise<boolean> {
  if (!isConfigured) throw new Error('Account creation is not configured yet. Continue as guest to explore the app.')
  setGuestMode(false)
  const { data, error } = await supabase.auth.signUp({ email, password })
  if (error) throw error
  return data.session === null
}

/** Where the reset email links to. */
export const RESET_PATH = '/reset-password'

/** Emails a link to choose a new password. Says nothing about whether the address has an account. */
export async function requestPasswordReset(email: string): Promise<void> {
  if (!isConfigured) throw new Error('Accounts are not configured yet.')
  const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}${RESET_PATH}` })
  if (error) throw error
}

/** Signs in with the tokens from a reset link, so a new password can be set. */
export async function startPasswordRecovery(tokens: { accessToken: string; refreshToken: string }): Promise<void> {
  setGuestMode(false)
  const { error } = await supabase.auth.setSession({ access_token: tokens.accessToken, refresh_token: tokens.refreshToken })
  if (error) throw error
}

/** Sets a new password for whoever is signed in. */
export async function setNewPassword(password: string): Promise<void> {
  if (password.length < 6) throw new Error('Use at least 6 characters.')
  const { error } = await supabase.auth.updateUser({ password })
  if (error) throw error
}

export async function signOut(): Promise<void> {
  if (isGuestMode()) {
    setGuestMode(false)
    return
  }
  forgetUser()
  const { error } = await supabase.auth.signOut()
  // Without a connection the server can't be told; still end the session on this device.
  if (error) await supabase.auth.signOut({ scope: 'local' })
  window.dispatchEvent(new Event('fitpip-auth-change'))
}

export function signInAsGuest(): void {
  setGuestMode(true)
}
