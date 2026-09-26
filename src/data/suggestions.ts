import { FunctionsFetchError, FunctionsHttpError } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { classifyFailure, messageFor, type SuggestionErrorCode } from '../lib/suggestionErrors'
import type { SuggestionContext, SuggestionResult } from '../types/suggestion'
import { isGuestMode } from './guest'
import { listExercises } from './exercises'
import { listWeekPlan } from './weekPlan'
import { listTemplates } from './templates'
import { loadTrainingWindow } from './trainingWindow'

export class SuggestionError extends Error {
  code: SuggestionErrorCode

  constructor(code: SuggestionErrorCode, message = messageFor(code)) {
    super(message)
    this.name = 'SuggestionError'
    this.code = code
  }
}

// The function tries up to three model calls of at most 50 s each, so allow a little over that.
const REQUEST_TIMEOUT_MS = 160_000

function isSuggestionResult(value: unknown): value is SuggestionResult {
  if (typeof value !== 'object' || value === null) return false
  const v = value as { suggestion?: { name?: unknown; rationale?: unknown; exercises?: unknown }; model?: unknown }
  return (
    typeof v.model === 'string' &&
    typeof v.suggestion?.name === 'string' &&
    typeof v.suggestion.rationale === 'string' &&
    Array.isArray(v.suggestion.exercises) &&
    v.suggestion.exercises.every(
      (e) => typeof e?.exercise_id === 'string' && typeof e.name === 'string' && Number.isInteger(e.target_sets) && Number.isInteger(e.target_reps),
    )
  )
}

/** Asks the suggest-workout Edge Function for a workout. Throws a SuggestionError the UI can explain. */
export async function requestSuggestion(context: SuggestionContext): Promise<SuggestionResult> {
  if (isGuestMode()) throw new SuggestionError('guest')

  const { data, error } = await supabase.functions.invoke<unknown>('suggest-workout', { body: context, timeout: REQUEST_TIMEOUT_MS })
  if (error) {
    if (error instanceof FunctionsHttpError) {
      const response = error.context as Response
      const body: unknown = await response.json().catch(() => null)
      const failure = classifyFailure(response.status, body)
      throw new SuggestionError(failure.code, failure.message)
    }
    throw new SuggestionError(error instanceof FunctionsFetchError ? 'offline' : 'failed')
  }
  if (!isSuggestionResult(data)) throw new SuggestionError('failed')
  return data
}

/** Everything the suggestion is based on, fetched together. */
export async function loadSuggestionInputs() {
  const [exercises, window, weekPlan, templates] = await Promise.all([
    listExercises(),
    loadTrainingWindow(30),
    listWeekPlan(),
    listTemplates(),
  ])
  return { exercises, sessions: window.sessions, sets: window.sets, weekPlan, templates }
}
