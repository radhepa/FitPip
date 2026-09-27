import { ASSESSMENT_EXERCISES } from '../../config/assessment'
import { rankInfo } from '../../config/ranks'
import { assessStrength, type Assessment } from '../../lib/assessment'
import { RankEmblem } from '../RankEmblem'
import { countOf } from '../../lib/format'

export function AssessmentResult({ assessment }: { assessment: Assessment }) {
  const result = assessStrength(assessment)
  const rank = rankInfo(result.rank)
  return <div className="grid grid-cols-1 gap-4">
    <div className="welcome-result card-hero rounded-3xl p-5 text-center">
      <div className="flex justify-center"><RankEmblem rank={rank.rank} size={132} label={`${rank.name} starting rank`} className="badge-pop" /></div>
      <p className="mt-2 text-xs font-extrabold tracking-wider text-muted uppercase">Your starting rank</p>
      <p className="mt-1 font-display text-4xl font-extrabold">{rank.name}</p>
      <p className="mt-2 text-sm text-muted">{result.answered ? `Estimated from ${result.answered} of 5 exercises. Skipped exercises don’t lower your score.` : 'A fresh start. With no exercise scores yet, you’ll begin at Wood.'}</p>
    </div>
    <ol className="m-0 grid list-none grid-cols-1 gap-2 p-0" aria-label="Your exercise estimates">
      {ASSESSMENT_EXERCISES.map((exercise) => {
        const lift = result.lifts.find((l) => l.key === exercise.key)
        return <li key={exercise.key} className="flex items-center gap-3 rounded-xl bg-surface-2 px-3 py-2">
          <RankEmblem rank={lift?.rank ?? null} size={36} />
          <span className="min-w-0 flex-1 text-sm font-bold">{exercise.name}<span className="block text-xs font-normal text-muted">{lift ? `${lift.kind === 'load' ? `${lift.weight} ${assessment.unit} × ` : ''}${countOf(lift.reps, 'rep')}` : 'Not included'}</span></span>
          <span className="text-sm font-bold">{lift ? rankInfo(lift.rank).name : 'Skipped'}</span>
        </li>
      })}
    </ol>
    <p className="text-xs text-muted">This starting estimate averages your answered exercise scores using FitPip’s strength standards. Logged workouts build your separate overall rank across six body areas. These answers earn no workout XP.</p>
  </div>
}
