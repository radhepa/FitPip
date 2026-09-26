/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string
  readonly VITE_SUPABASE_ANON_KEY?: string
  /** "true" shows the Suggest a workout feature (needs the Edge Function and an OpenRouter key). */
  readonly VITE_ENABLE_SUGGEST?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
