import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/Button'
import { ErrorBanner } from '../components/feedback'
import { fieldInput } from '../components/fieldStyles'
import { PageHeader } from '../components/PageHeader'
import { SuggestionCard } from '../components/SuggestionCard'
import { SuggestionSetupNotice } from '../components/SuggestionSetupNotice'
import { Pip } from '../components/Pip'
import { createTemplate } from '../data/templates'
import { DataError, errorMessage } from '../data/unwrap'
import { useSettings } from '../hooks/useSettings'
import { useNewWorkout } from '../hooks/useNewWorkout'
import { useSuggestion } from '../hooks/useSuggestion'
import { SETUP_CODES } from '../lib/suggestionErrors'
import { planFromSuggestion } from '../lib/workoutBlocks'
import type { Suggestion } from '../types/suggestion'

/** Ask for a workout based on recent training, muscle volume and today's plan, then start it or save it. */
export function SuggestScreen() {
  const navigate = useNavigate()
  const { unit } = useSettings()
  const { state, request } = useSuggestion()
  const { create, creating, error: startError } = useNewWorkout()
  const [focus, setFocus] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  function ask(e: FormEvent) {
    e.preventDefault()
    setSaveError(null)
    void request(focus)
  }

  /** Opens a workout set up with the suggested plan, ready to adjust and begin (no template is created). */
  const startWorkout = (suggestion: Suggestion, name: string) => create({ name, plan: planFromSuggestion(suggestion) })

  async function saveTemplate(suggestion: Suggestion, name: string) {
    setSaving(true)
    setSaveError(null)
    try {
      const created = await createTemplate(
        name,
        suggestion.exercises.map((e) => ({ exerciseId: e.exercise_id, targetSets: e.target_sets, targetReps: e.target_reps })),
      )
      navigate(`/plan/templates/${created.template.id}`)
    } catch (e) {
      setSaveError(
        e instanceof DataError && e.code === '23505'
          ? `You already have a template called “${name}”. Change the name and try again.`
          : errorMessage(e),
      )
      setSaving(false)
    }
  }

  const loading = state.status === 'loading'

  return (
    <>
      <PageHeader back title="Suggest a workout" subtitle="Uses your recent training, muscle volume and today’s plan." />

      <form onSubmit={ask} className="mb-6 grid grid-cols-1 gap-3">
        <label className="block">
          <span className="mb-1 block text-sm text-muted">Anything to focus on? (optional)</span>
          <input
            value={focus}
            onChange={(e) => setFocus(e.target.value)}
            maxLength={200}
            placeholder="e.g. legs, 45 minutes, sore shoulder"
            className={fieldInput}
          />
        </label>
        <Button type="submit" variant="primary" block disabled={loading}>
          {loading ? 'Working on it…' : state.status === 'done' ? 'Get another suggestion' : 'Get a suggestion'}
        </Button>
      </form>

      {loading && <div className="flex justify-center py-4"><Pip pose="think" size={120} line="Checking recent training." /></div>}

      {state.status === 'error' &&
        (SETUP_CODES.includes(state.error.code) ? (
          <><div className="flex justify-center py-4"><Pip pose="think" size={104} /></div><SuggestionSetupNotice failure={state.error.code} message={state.error.message} /></>
        ) : (
          <ErrorBanner error={state.error} onRetry={() => void request(focus)} />
        ))}

      {state.status === 'done' && (
        <SuggestionCard
          key={state.id}
          result={state.result}
          exercises={state.exercises}
          unit={unit}
          starting={creating}
          saving={saving}
          error={startError ?? saveError}
          onStart={(name) => void startWorkout(state.result.suggestion, name)}
          onSave={(name) => void saveTemplate(state.result.suggestion, name)}
        />
      )}
    </>
  )
}
