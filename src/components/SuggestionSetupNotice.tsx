import type { SuggestionErrorCode } from '../lib/suggestionErrors'

const code = 'rounded bg-surface-2 px-1.5 py-0.5 text-[.85em]'

/** What to do when the suggestion service isn't ready. Shown instead of an error for owner-fixable problems. */
export function SuggestionSetupNotice({ failure, message }: { failure: SuggestionErrorCode; message: string }) {
  return (
    <div role="status" className="card p-4">
      <span className="section-label">Setup needed</span>
      <h2 className="m-0 mb-2 font-display text-xl font-extrabold">{message}</h2>

      {failure === 'not_deployed' && (
        <p className="m-0 text-sm text-muted">
          Deploy the <span className={code}>suggest-workout</span> function to your Supabase project, then add your OpenRouter key. The steps are in the README under “Workout suggestions”.
        </p>
      )}
      {failure === 'not_configured' && (
        <ol className="m-0 grid list-none grid-cols-1 gap-2 p-0 text-sm text-muted">
          <li>
            1. Create a key at <span className={code}>openrouter.ai/keys</span>.
          </li>
          <li>
            2. In Supabase, open Edge Functions → Secrets and add <span className={code}>OPENROUTER_API_KEY</span>, or run{' '}
            <span className={code}>npx supabase secrets set OPENROUTER_API_KEY=your-key</span>.
          </li>
          <li>3. Come back and tap “Get a suggestion”. Nothing else needs changing.</li>
        </ol>
      )}
      {failure === 'bad_key' && (
        <p className="m-0 text-sm text-muted">
          Create a fresh key at <span className={code}>openrouter.ai/keys</span> and replace the <span className={code}>OPENROUTER_API_KEY</span> secret.
        </p>
      )}
      {failure === 'no_credits' && (
        <p className="m-0 text-sm text-muted">
          Add credits at <span className={code}>openrouter.ai/credits</span>. A suggestion costs a fraction of a cent with the default model.
        </p>
      )}
    </div>
  )
}
