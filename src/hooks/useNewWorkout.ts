import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createWorkout, getOpenSession } from '../data/sessions'
import { getTemplate } from '../data/templates'
import { errorMessage } from '../data/unwrap'
import { planFromTemplate, type PlanItem } from '../lib/workoutBlocks'
import type { Category } from '../types/db'

export interface NewWorkoutRequest {
  /** Set the workout up from this template (its exercises are copied in). */
  template?: { id: string; name: string }
  /** Name for a workout with no template (for example one from a suggestion). */
  name?: string
  /** The exercises to set up with; defaults to the template's, or none. */
  plan?: PlanItem[]
  /** Open the exercise picker on this kind of activity straight away. */
  pick?: Category
}

/**
 * Opens a new workout in its set-up state: pick exercises first, then begin. Nothing is timed until
 * the workout is begun. Offers to continue a workout that is already open instead of making a second.
 */
export function useNewWorkout() {
  const navigate = useNavigate()
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function create(request: NewWorkoutRequest = {}) {
    setCreating(true)
    setError(null)
    try {
      const open = await getOpenSession()
      if (open) {
        if (window.confirm('You already have a workout open. Continue it instead of starting a new one?')) {
          navigate(`/workout/${open.id}`)
        }
        setCreating(false)
        return
      }
      // Read the routine as saved now (it may have just been edited), for its exercises and its name.
      const template = request.template ? await getTemplate(request.template.id) : null
      const plan = request.plan ?? (template ? planFromTemplate(template.items) : [])
      const name = template?.template.name ?? request.template?.name ?? request.name
      const session = await createWorkout({ name, templateId: request.template?.id, plan })
      navigate(`/workout/${session.id}${request.pick ? `?add=${request.pick}` : ''}`)
    } catch (e) {
      setError(errorMessage(e))
      setCreating(false)
    }
  }

  return { create, creating, error }
}
