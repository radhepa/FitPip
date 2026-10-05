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
          push-ups) and is compared with published lifting-community tables for your selected comparison sex and bodyweight. That gives an estimated percentile
          and one of {RANKS.length} ranks, from {RANKS[0].name} to {RANKS.at(-1)!.name}. These compare people who lift, rather than all adults.
          Exercises without a suitable comparison table stay unranked.
        </p>
        <p>
          <strong className="text-text">Muscles.</strong> Each muscle takes the rank of its best lift. Lifts where it only helps count at 80%. Your
          overall rank averages chest, back, shoulders, arms, legs and core. Muscle and overall ranks are strength indicators from your lifts,
          rather than measured population percentiles for individual muscles.
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
