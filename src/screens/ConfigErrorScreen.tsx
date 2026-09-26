export function ConfigErrorScreen() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-4 py-10">
      <span className="section-label">Setup needed</span>
      <h1 className="font-display text-3xl font-bold [font-variation-settings:'wdth'_82]">Connect your training log</h1>
      <p className="mt-2 text-muted">
        Copy <code className="rounded bg-surface-2 px-1">.env.example</code> to{' '}
        <code className="rounded bg-surface-2 px-1">.env</code> and set:
      </p>
      <pre className="mt-3 overflow-x-auto rounded-[10px] border border-line-strong bg-surface p-4 text-sm">
        VITE_SUPABASE_URL{'\n'}VITE_SUPABASE_ANON_KEY
      </pre>
      <p className="mt-3 text-sm text-muted">
        Find both in the Supabase dashboard under Project Settings → API, then restart the dev server. On Vercel or
        Cloudflare Pages, add them as environment variables and redeploy.
      </p>
    </main>
  )
}
