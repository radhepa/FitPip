import { createClient } from '@supabase/supabase-js'

/** A blank or whitespace-only value counts as not set (a host's empty env var must not crash the app). */
const clean = (value: string | undefined) => value?.trim() || undefined

const url = clean(import.meta.env.VITE_SUPABASE_URL)
const anonKey = clean(import.meta.env.VITE_SUPABASE_ANON_KEY)

/** False until .env is filled in; the app shows a setup screen instead of calling Supabase. */
export const isConfigured = Boolean(url && anonKey)

/**
 * A quick, cheap "can I reach the server at all?" check. Much faster than waiting for Supabase's
 * client, which retries for up to 30 seconds when the connection is bad.
 */
export async function serverReachable(timeoutMs = 4_000): Promise<boolean> {
  if (!url || !anonKey) return false
  try {
    const response = await fetch(`${url}/auth/v1/settings`, { headers: { apikey: anonKey }, signal: AbortSignal.timeout(timeoutMs) })
    return response.status < 500
  } catch {
    return false
  }
}

// Placeholders keep this module importable when unconfigured; they are never used for requests.
// Only the public anon key belongs here. Row level security protects the data.
export const supabase = createClient(url ?? 'http://localhost:54321', anonKey ?? 'not-configured', {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false },
})
