import { Link } from 'react-router-dom'
import { listFavoriteSessions } from '../data/sessions'
import { useAsync } from '../hooks/useAsync'
import { useRepeatWorkout } from '../hooks/useRepeatWorkout'
import type { Exercise } from '../types/db'
import { ErrorBanner } from './feedback'
import { FavoriteWorkoutList } from './FavoriteWorkoutList'

const SHOWN = 3

/** The newest starred workouts on Today, one tap from doing them again. Hidden until something is starred. */
export function TodayFavorites({ exerciseById }: { exerciseById: Map<string, Exercise> }) {
  const list = useAsync(listFavoriteSessions, [], { cacheKey: 'favorites' })
  const { repeat, repeating, error } = useRepeatWorkout()
  const items = list.data ?? []
  if (items.length === 0) return null

  return (
    <section className="section-block">
      <div className="section-heading">
        <h2>Favorites</h2>
        {items.length > SHOWN && (
          <Link to="/history?show=favorites" className="text-link">
            See all
          </Link>
        )}
      </div>
      <FavoriteWorkoutList items={items.slice(0, SHOWN)} exerciseById={exerciseById} busy={repeating} onRepeat={(item) => repeat(item, exerciseById)} />
      <ErrorBanner error={error} />
    </section>
  )
}
