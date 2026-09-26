import type { Session as AuthSession } from '@supabase/supabase-js'
import { isConfigured, supabase } from '../lib/supabase'
import { GUEST_USER_ID, isGuestMode, setGuestMode } from './guest'

export type { AuthSession }

const guestSession = () => ({
  guest: true,
  user: { id: GUEST_USER_ID, email: 'guest@fitpip.local' },
}) as unknown as AuthSession

export async function getAuthSession(): Promise<AuthSession | null> {
  if (isGuestMode()) return guestSession()
  const { data, error } = await supabase.auth.getSession()
  if (error) throw error
  return data.session
}

export function onAuthChange(callback: (session: AuthSession | null) => void): () => void {
  const { data } = supabase.auth.onAuthStateChange((_event, session) => callback(session))
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

export async function signOut(): Promise<void> {
  if (isGuestMode()) {
    setGuestMode(false)
    return
  }
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export function signInAsGuest(): void {
  setGuestMode(true)
}
