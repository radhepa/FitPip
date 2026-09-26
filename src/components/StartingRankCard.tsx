import { Link } from 'react-router-dom'
import { rankInfo } from '../config/ranks'
import type { AssessmentResult } from '../lib/assessment'
import { RankEmblem } from './RankEmblem'

export function StartingRankCard({ result }: { result: AssessmentResult }) {
  return <section className="card p-4" aria-label="Your fitness assessment">
    <div className="flex items-center gap-3">
      <RankEmblem rank={result.rank} size={56} />
      <div><p className="text-xs font-bold text-muted">FITNESS ASSESSMENT</p><h2 className="m-0 font-display text-xl font-extrabold">{rankInfo(result.rank).name} starting rank</h2></div>
    </div>
    <p className="mt-3 text-sm text-muted">{result.answered ? `Your starting estimate from ${result.answered} exercise${result.answered === 1 ? '' : 's'}.` : 'Your starting point until you have exercise scores.'} Your overall rank is calculated separately from logged workouts.</p>
    <Link to="/welcome" state={{ returnTo: '/profile' }} className="app-button button-secondary mt-3 w-full">Review or retake assessment</Link>
  </section>
}
