import { XP_RULES } from '../config/xp'
import { RANKS } from '../config/ranks'

/** A short, honest explanation of where ranks, badges and XP come from. */
export function HowRanksWork() {
  return (
    <details className="card p-4">
      <summary className="min-h-11 cursor-pointer py-2 font-display text-lg font-extrabold">How ranks and XP work</summary>
      <div className="mt-2 grid grid-cols-1 gap-3 text-sm text-muted">
        <p>
          <strong className="text-text">Lift badges.</strong> Your best set of each lift becomes an estimated one-rep max (or reps, for pull-ups and
          push-ups) and is compared with published strength standards for people who lift, adjusted to your bodyweight. That gives a percentile
          and one of {RANKS.length} ranks, from {RANKS[0].name} to {RANKS.at(-1)!.name}. Lighter lifters are expected to lift a bit more per pound,
          heavier ones a bit less.
        </p>
        <p>
          <strong className="text-text">Muscles.</strong> Each muscle takes the rank of its best lift. Lifts where it only helps count at 80%. Your
          overall rank averages chest, back, shoulders, arms, legs and core.
        </p>
        <p>
          <strong className="text-text">Cardio and practice.</strong> Running, rowing, the ski erg, outdoor cycling and freestyle swimming are
          ranked on your best pace. Everything else (walking, yoga, boxing, sports…) ranks up with hours put in.
        </p>
        <p>
          <strong className="text-text">XP.</strong> {XP_RULES.liftSet} per lifting set, {XP_RULES.perActiveMinute} per minute of cardio or
          practice, {XP_RULES.finishedWorkout} for finishing a workout, {XP_RULES.personalRecord} for each personal record and {XP_RULES.firstTime}
          {' '}for trying something new. Levels have no cap.
        </p>
        <p>
          Standards are estimates, not a lab test, and machines vary between gyms. Everything is worked out from your history each time, so
          editing a set or a weigh-in updates your ranks straight away.
        </p>
      </div>
    </details>
  )
}
