import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '../components/Button'
import { ErrorBanner } from '../components/feedback'
import { RESET_PATH, setNewPassword, startPasswordRecovery } from '../data/auth'
import { useAuth } from '../hooks/useAuth'
import { parseRecoveryHash } from '../lib/recoveryLink'

type Stage = { kind: 'checking' } | { kind: 'ready' } | { kind: 'failed'; message: string } | { kind: 'nothing' }

const inputClass = 'field !min-h-14'

/** Where the reset email lands: sign in with the link, then choose a new password. */
export function ResetPasswordScreen() {
  const navigate = useNavigate()
  const { session } = useAuth()
  // Read once, as the page opens (the hash is cleared right after).
  const [link] = useState(() => parseRecoveryHash(window.location.hash))
  const [stage, setStage] = useState<Stage>(() =>
    !link ? { kind: 'nothing' } : link.kind === 'error' ? { kind: 'failed', message: link.message } : { kind: 'checking' },
  )
  const [password, setPassword] = useState('')
  const [again, setAgain] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<unknown>(null)

  useEffect(() => {
    // The tokens should not stay in the address bar or the history.
    if (window.location.hash) window.history.replaceState(null, '', RESET_PATH)
    if (link?.kind !== 'tokens') return
    startPasswordRecovery(link)
      .then(() => setStage({ kind: 'ready' }))
      .catch(() => setStage({ kind: 'failed', message: 'This reset link has expired or was already used. Ask for a new one from the sign-in screen.' }))
  }, [link])

  // Opened without a link but already signed in: it can still be used to change the password.
  const canSet = stage.kind === 'ready' || (stage.kind === 'nothing' && session && !session.guest)

  async function submit(e: FormEvent) {
    e.preventDefault()
    if (password !== again) {
      setError(new Error("The two passwords don't match."))
      return
    }
    setBusy(true)
    setError(null)
    try {
      await setNewPassword(password)
      navigate('/', { replace: true })
    } catch (err) {
      setError(err)
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="mx-auto min-h-dvh w-full max-w-md px-4 pt-[max(3rem,12vh)] pb-8">
      <section className="card min-w-0 p-5">
        <h1 className="mb-2 font-display text-4xl leading-none font-extrabold">New password</h1>
        {stage.kind === 'checking' && <p className="text-muted">Checking your link…</p>}
        {stage.kind === 'failed' && <p className="text-muted">{stage.message}</p>}
        {stage.kind === 'nothing' && !canSet && <p className="text-muted">Open the reset link from your email to choose a new password.</p>}
        {canSet && (
          <form onSubmit={submit} className="mt-4 space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold text-muted">New password</span>
              <input type="password" required minLength={6} autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass} />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold text-muted">Type it again</span>
              <input type="password" required minLength={6} autoComplete="new-password" value={again} onChange={(e) => setAgain(e.target.value)} className={inputClass} />
            </label>
            <ErrorBanner error={error} />
            <Button type="submit" variant="primary" block disabled={busy}>
              {busy ? 'Saving…' : 'Save and open the app'}
            </Button>
          </form>
        )}
        {!canSet && stage.kind !== 'checking' && (
          <Link to="/login" className="app-button button-secondary mt-4 w-full">
            Back to sign in
          </Link>
        )}
      </section>
    </main>
  )
}
