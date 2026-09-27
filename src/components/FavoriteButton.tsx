import { useState } from 'react'
import { setFavorite } from '../data/sessions'
import { errorMessage } from '../data/unwrap'
import { StarIcon } from './icons'

interface Props {
  sessionId: string
  initial: boolean
  onError: (message: string | null) => void
}

/** Star / unstar a finished workout. Shows the new state at once and puts it back if saving fails. */
export function FavoriteButton({ sessionId, initial, onError }: Props) {
  const [on, setOn] = useState(initial)

  async function toggle() {
    const next = !on
    setOn(next)
    onError(null)
    try {
      await setFavorite(sessionId, next)
    } catch (e) {
      setOn(!next)
      onError(errorMessage(e))
    }
  }

  return (
    <button
      type="button"
      className={`icon-button favorite-button ${on ? 'is-on' : ''}`}
      aria-pressed={on}
      aria-label={on ? 'Remove from favorites' : 'Add to favorites'}
      title={on ? 'Remove from favorites' : 'Add to favorites'}
      onClick={toggle}
    >
      <StarIcon filled={on} />
    </button>
  )
}
