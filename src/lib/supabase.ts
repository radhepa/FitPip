import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

/** False until .env is filled in; the app shows a setup screen instead of calling Supabase. */
export const isConfigured = Boolean(url && anonKey)

// Placeholders keep this module importable when unconfigured; they are never used for requests.
// Only the public anon key belongs here. Row level security protects the data.
export const supabase = createClient(url ?? 'http://localhost:54321', anonKey ?? 'not-configured', {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false },
})
