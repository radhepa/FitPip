import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Button } from '../components/Button'
import { ErrorBanner, Loading } from '../components/feedback'
import { BackIcon, ChevronIcon } from '../components/icons'
import { Pip } from '../components/Pip'
import { AssessmentBasics } from '../components/onboarding/AssessmentBasics'
import { AssessmentExercise } from '../components/onboarding/AssessmentExercise'
import { AssessmentResult } from '../components/onboarding/AssessmentResult'
import { ASSESSMENT_EXERCISES } from '../config/assessment'
import { finishOnboarding, loadWelcomeData, saveAssessmentDraft } from '../data/onboarding'
import { useAsync } from '../hooks/useAsync'
import { assessmentFromDraft, newAssessmentDraft } from '../lib/assessmentDraft'
import { fromKg, toKg } from '../lib/strengthRank'
import './welcome.css'

type WelcomeData = Awaited<ReturnType<typeof loadWelcomeData>>

export function WelcomeScreen() {
  const { data, loading, error, reload } = useAsync(loadWelcomeData, [])
  if (error) return <main className="app-content"><ErrorBanner error={error} onRetry={reload} /></main>
  if (loading || !data) return <Loading label="Pip is getting ready…" />
  return <AssessmentFlow initial={data} />
}

function AssessmentFlow({ initial }: { initial: WelcomeData }) {
  const navigate = useNavigate()
  const location = useLocation()
  const heading = useRef<HTMLHeadingElement>(null)
  const [draft, setDraft] = useState(() => initial.draft ?? newAssessmentDraft(initial.settings.weight_unit, initial.settings.compare_sex,
    initial.latestWeight ? Math.round(fromKg(toKg(initial.latestWeight.weight, initial.latestWeight.unit), initial.settings.weight_unit) * 100) / 100 : undefined))
  const [step, setStep] = useState(0)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<unknown>(null)
  const [draftError, setDraftError] = useState(false)
  const exercise = ASSESSMENT_EXERCISES[step - 1]
  const isResult = step === 6
  const title = step === 0 ? 'Let’s find your starting point.' : isResult ? 'Your next chapter starts here.' : `How about ${exercise.name.toLowerCase()}?`
  const subtitle = step === 0 ? 'A few basics, five familiar exercises, and a rank that reflects where you are today.' : isResult ? 'This is your starting line. Pip will be with you for what comes next.' : 'Tell Pip about your best recent effort. Haven’t tried it? That’s completely fine.'

  useEffect(() => { heading.current?.focus() }, [step])
  useEffect(() => {
    let active = true
    const timer = setTimeout(() => { void saveAssessmentDraft(draft).then(() => { if (active) setDraftError(false) }).catch(() => { if (active) setDraftError(true) }) }, 400)
    return () => { active = false; clearTimeout(timer) }
  }, [draft])

  async function finish(skip = false) {
    setBusy(true)
    setError(null)
    try {
      await finishOnboarding(skip ? undefined : assessmentFromDraft(draft))
      const returnTo = location.state?.returnTo
      navigate(skip && typeof returnTo === 'string' && /^\/(?!\/)/.test(returnTo) && !returnTo.includes('\\') ? returnTo : skip ? '/' : '/profile', { replace: true })
    } catch (e) { setError(e); setBusy(false) }
  }

  function next(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (busy) return
    setError(null)
    if (isResult) { void finish(); return }
    try {
      // Validate this step without requiring answers to later questions yet.
      const answers = Object.fromEntries(ASSESSMENT_EXERCISES.map((e) => [e.key,
        step > 0 && e.key === exercise.key ? draft.answers[e.key] : { done: false, weight: '', reps: '' },
      ])) as typeof draft.answers
      assessmentFromDraft({ ...draft, answers })
      if (step === 5) assessmentFromDraft(draft)
      setStep((s) => s + 1)
    } catch (e) { setError(e) }
  }

  return <main className="welcome-shell">
    <header className="welcome-header">
      <a href="/" onClick={(e) => { e.preventDefault(); if (!busy) void finish(true) }} className="flex items-center gap-2 font-display text-xl font-extrabold" aria-label="FitPip, skip assessment">
        <img src="/icons/icon-192.png" width="36" height="36" className="rounded-xl" alt="" />FitPip
      </a>
      <Button variant="ghost" size="sm" disabled={busy} onClick={() => void finish(true)}>Do this later</Button>
    </header>
    <div className="welcome-layout">
      <aside className="welcome-companion" aria-label="Your companion Pip">
        <div className="welcome-orbit" aria-hidden="true" />
        <div className="welcome-pip"><Pip pose={isResult ? 'cheer' : step === 0 ? 'idle' : 'think'} size={240} /></div>
        <p className="welcome-pip-line">{isResult ? 'Your story is just getting started.' : step === 0 ? 'Hi, I’m Pip. Let’s get to know you!' : `Just ${6 - step} ${6 - step === 1 ? 'exercise' : 'exercises'} to go. You’ve got this.`}</p>
        <p className="welcome-companion-note">YOUR PACE. YOUR PROGRESS.</p>
      </aside>
      <section className="welcome-panel" aria-labelledby="welcome-title">
        <div className="mb-6">
          <div className="mb-2 flex justify-between text-xs font-bold text-muted"><span>{step === 0 ? 'A little about you' : isResult ? 'Meet your starting rank' : `Exercise ${step} of 5`}</span><span>{step + 1} / 7</span></div>
          <div className="welcome-progress" role="progressbar" aria-label="Assessment progress" aria-valuemin={0} aria-valuemax={7} aria-valuenow={step + 1}>
            <span style={{ width: `${((step + 1) / 7) * 100}%` }} />
          </div>
        </div>
        <h1 ref={heading} tabIndex={-1} id="welcome-title" className="font-display text-3xl leading-tight font-extrabold outline-none">{title}</h1>
        <p className="mt-3 mb-6 text-sm text-muted">{subtitle}</p>
        <form onSubmit={next}>
          <fieldset disabled={busy} className="m-0 min-w-0 border-0 p-0">
            {step === 0 ? <AssessmentBasics value={draft} onChange={setDraft} /> : isResult ? <AssessmentResult assessment={assessmentFromDraft(draft)} /> :
              <AssessmentExercise key={exercise.key} exercise={exercise} value={draft.answers[exercise.key]} unit={draft.unit}
                onChange={(value) => setDraft({ ...draft, answers: { ...draft.answers, [exercise.key]: value } })} />}
          </fieldset>
          <div className="mt-4"><ErrorBanner error={error} /></div>
          {draftError && <p role="status" className="mt-3 text-xs text-danger">Your draft couldn’t be saved. Keep this page open and try finishing again.</p>}
          <div className="welcome-actions">
            {step > 0 && <Button variant="secondary" disabled={busy} onClick={() => { setError(null); setStep((s) => s - 1) }}><BackIcon size="size-4" />Back</Button>}
            <Button type="submit" variant="primary" className="flex-1" disabled={busy}>
              {busy ? 'Saving…' : isResult ? 'Save my starting rank' : step === 5 ? 'Find my rank' : step === 0 ? 'Let’s begin' : 'Continue'}{!busy && <ChevronIcon size="size-4" />}
            </Button>
          </div>
          <p className="mt-4 text-center text-xs text-muted">{isResult ? 'Your assessment stays on this device. You can retake it from Settings.' : 'Answers are saved on this device as you go.'}</p>
        </form>
      </section>
    </div>
  </main>
}
