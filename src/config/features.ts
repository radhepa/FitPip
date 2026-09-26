/**
 * Workout suggestions need the `suggest-workout` Edge Function deployed and an OpenRouter key set
 * (see the README). Until then the public build hides them. Turn them back on by setting
 * `VITE_ENABLE_SUGGEST=true` and rebuilding; nothing else needs to change.
 */
export const SUGGEST_ENABLED = import.meta.env.VITE_ENABLE_SUGGEST === 'true'
