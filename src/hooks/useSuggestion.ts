import { useCallback, useState } from 'react'
import { SuggestionError, loadSuggestionInputs, requestSuggestion } from '../data/suggestions'
import { errorMessage } from '../data/unwrap'
import { buildSuggestionContext } from '../lib/suggestionContext'
import type { Exercise } from '../types/db'
import type { SuggestionResult } from '../types/suggestion'
import { useSettings } from './useSettings'

export type SuggestionState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'error'; error: SuggestionError }
  /** `id` changes on every new suggestion so the card starts fresh (its name field resets). */
  | { status: 'done'; id: number; result: SuggestionResult; exercises: Exercise[] }

/** Gathers the lifter's recent training, asks the suggestion function, and holds the outcome. */
export function useSuggestion() {
  const { unit } = useSettings()
  const [state, setState] = useState<SuggestionState>({ status: 'idle' })

  const request = useCallback(
    async (focus: string) => {
      setState({ status: 'loading' })
      try {
        const inputs = await loadSuggestionInputs()
        if (inputs.exercises.length === 0) throw new SuggestionError('empty_bank')
        const result = await requestSuggestion(buildSuggestionContext({ ...inputs, unit, focus }))
        setState({ status: 'done', id: Date.now(), result, exercises: inputs.exercises })
      } catch (e) {
        setState({ status: 'error', error: e instanceof SuggestionError ? e : new SuggestionError('failed', errorMessage(e)) })
      }
    },
    [unit],
  )

  return { state, request }
}
