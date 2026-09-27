import { useState, type FormEvent } from 'react'
import { Navigate } from 'react-router-dom'
import { Button } from '../components/Button'
import { Pip } from '../components/Pip'
import { ErrorBanner } from '../components/feedback'
import { requestPasswordReset, signIn, signInAsGuest, signUp } from '../data/auth'
import { useAuth } from '../hooks/useAuth'
import { brand } from '../config/brand'

const inputClass = 'field !min-h-14'

export function LoginScreen() {
  const { session } = useAuth()
  const [mode, setMode] = useState<'in' | 'up'>('in')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<unknown>(null)
  const [notice, setNotice] = useState<string | null>(null)

  if (session) return <Navigate to="/" replace />

  async function forgot() {
    setError(null)
    setNotice(null)
    const address = email.trim()
    if (!address) {
      setError(new Error('Type your email above, then tap “Forgot password?” again.'))
      return
    }
    setBusy(true)
    try {
      await requestPasswordReset(address)
      setNotice(`If ${address} has an account, a link to choose a new password is on its way. Open it on this device.`)
    } catch (err) {
      setError(err)
    } finally {
      setBusy(false)
    }
  }

  async function submit(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    setNotice(null)
    try {
      if (mode === 'in') {
        await signIn(email.trim(), password)
      } else if (await signUp(email.trim(), password)) {
        setNotice('Check your email to confirm your account, then sign in.')
        setMode('in')
      }
    } catch (err) {
      setError(err)
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="mx-auto min-h-dvh w-full max-w-4xl px-4 pt-[max(3rem,12vh)] pb-8 md:px-8">
      <div className="mx-auto max-w-md">
      <div className="card card-hero mb-5 flex items-end gap-3 p-4">
        <Pip pose="cheer" size={110} />
        <div className="mb-2 min-w-0">
          <p className="gradient-text font-display text-3xl font-extrabold">{brand.name}</p>
          <p className="text-sm font-semibold text-muted">Lift, run, swim, stretch. Pip keeps count.</p>
        </div>
      </div>
      <section className="card min-w-0 p-5">
        <h1 className="mb-5 font-display text-4xl leading-none font-extrabold">
          {mode === 'in' ? 'Welcome back' : 'Create account'}
        </h1>

      <form onSubmit={submit} className="space-y-4">
        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold text-muted">Email</span>
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold text-muted">Password</span>
          <input
            type="password"
            required
            minLength={6}
            autoComplete={mode === 'in' ? 'current-password' : 'new-password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClass}
          />
        </label>
        {notice && <p className="rounded-xl bg-accent/15 p-3 text-sm text-accent">{notice}</p>}
        <ErrorBanner error={error} />
        <Button type="submit" variant="primary" block disabled={busy}>
          {busy ? 'Please wait…' : mode === 'in' ? 'Sign in' : 'Create account'}
        </Button>
        {mode === 'in' && (
          <>
            <button type="button" onClick={forgot} disabled={busy} className="block min-h-11 w-full text-center text-sm font-semibold text-accent">
              Forgot password?
            </button>
            <Button type="button" variant="ghost" block onClick={signInAsGuest}>Continue as guest</Button>
            <p className="m-0 text-center text-xs text-muted">Guest workouts stay on this device.</p>
          </>
        )}
      </form>

      <button
        type="button"
        onClick={() => {
          setMode(mode === 'in' ? 'up' : 'in')
          setError(null)
        }}
        className="mt-4 min-h-11 text-sm font-semibold text-muted underline decoration-line-strong underline-offset-4"
      >
        {mode === 'in' ? 'No account yet? Create one' : 'Already have an account? Sign in'}
      </button>
      </section>
      </div>
    </main>
  )
}
