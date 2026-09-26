import { useMemo, useState } from 'react'
import { defaultTarget, sectionOf, type Section } from '../lib/activity'
import { computeVolume, workFromPlan } from '../lib/muscleVolume'
import { addManyToPlan, moveWithinGroup, removeFromPlan, setPlanTargets } from '../lib/sessionPlan'
import { bySection, type PlanItem } from '../lib/workoutBlocks'
import type { Category, Exercise, WeightUnit } from '../types/db'
import { Button } from './Button'
import { CardioQuickAdd } from './CardioQuickAdd'
import { ExercisePicker } from './ExercisePicker'
import { PlayIcon } from './icons'
import { MuscleVolumePanel } from './MuscleVolumePanel'
import { PlannedExerciseRow } from './PlannedExerciseRow'
import { SectionHeader } from './SectionHeader'

interface Props {
  plan: PlanItem[]
  exercises: Exercise[]
  unit: WeightUnit
  beginning: boolean
  /** Open the picker straight away on this kind of activity (from a quick start). */
  initialPick: Category | null
  onPlanChange: (plan: PlanItem[]) => void
  onExerciseAdded: (exercise: Exercise) => void
  onBegin: () => void
  onDiscard: () => void
}

const PICK_FOR: Record<Section, Category> = { strength: 'strength', cardio: 'cardio', mobility: 'yoga' }

/** A workout that has not begun: line up lifts, cardio and mobility (with targets), then begin the clock. */
export function WorkoutBuilder({ plan, exercises, unit, beginning, initialPick, onPlanChange, onExerciseAdded, onBegin, onDiscard }: Props) {
  const [picking, setPicking] = useState<Category | 'all' | null>(initialPick)
  const exerciseById = useMemo(() => new Map(exercises.map((e) => [e.id, e])), [exercises])
  const volume = useMemo(() => computeVolume(workFromPlan(plan, exerciseById)), [plan, exerciseById])
  const sectionFor = (item: PlanItem): Section => {
    const exercise = exerciseById.get(item.exerciseId)
    return exercise ? sectionOf(exercise) : 'strength'
  }
  const sections = bySection(plan, sectionFor)
  const present = useMemo(() => new Set(plan.map((p) => p.exerciseId)), [plan])
  const add = (picked: Exercise[]) => onPlanChange(addManyToPlan(plan, picked.map((e) => ({ exerciseId: e.id, target: defaultTarget(e) }))))
  const hasLifts = plan.some((p) => exerciseById.get(p.exerciseId)?.tracking === 'reps')
  let index = 0

  return (
    <>
      {plan.length === 0 && (
        <p className="card card-pad text-sm text-muted">
          Line up what you plan to do: lifts, a run, a swim, some stretches. Or begin empty and add things as you go.
        </p>
      )}

      {sections.map(({ section, items }) => (
        <div key={section}>
          <SectionHeader section={section} count={items.length} onAdd={() => setPicking(PICK_FOR[section])} />
          {section === 'cardio' && <CardioQuickAdd exercises={exercises} present={present} onAdd={(e) => add([e])} />}
          {items.length > 0 && (
            <ul className="stagger m-0 grid list-none grid-cols-1 gap-2.5 p-0">
              {items.map((item, i) => (
                <PlannedExerciseRow
                  key={item.exerciseId}
                  index={index++}
                  item={{ target_sets: item.targetSets, target_reps: item.targetReps, target_seconds: item.targetSeconds ?? null }}
                  exercise={exerciseById.get(item.exerciseId)}
                  isFirst={i === 0}
                  isLast={i === items.length - 1}
                  onChange={(patch) =>
                    onPlanChange(setPlanTargets(plan, item.exerciseId, { targetSets: patch.target_sets, targetReps: patch.target_reps, targetSeconds: patch.target_seconds ?? undefined }))
                  }
                  onMove={(direction) => onPlanChange(moveWithinGroup(plan, item.exerciseId, direction, sectionFor))}
                  onRemove={() => onPlanChange(removeFromPlan(plan, item.exerciseId))}
                />
              ))}
            </ul>
          )}
        </div>
      ))}

      <div className="sticky bottom-[calc(env(safe-area-inset-bottom)+5.75rem)] z-30 mt-6 md:bottom-4">
        <Button variant="primary" block className="min-h-15 text-lg" disabled={beginning} onClick={onBegin}>
          <PlayIcon /> {beginning ? 'Starting…' : plan.length === 0 ? 'Begin empty' : `Begin workout · ${plan.length}`}
        </Button>
      </div>

      {hasLifts && (
        <div className="mt-8">
          <MuscleVolumePanel label="Planned volume" title="What it trains" caption="Target lifting sets per muscle in this workout." volume={volume} unit={unit} periodLabel="this workout" />
        </div>
      )}

      <Button variant="ghost" block className="mt-2 !text-danger" onClick={onDiscard}>
        Discard workout
      </Button>

      <ExercisePicker
        open={picking !== null}
        initialCategory={picking ?? 'all'}
        exercises={exercises}
        addedIds={present}
        onClose={() => setPicking(null)}
        onPick={(picked) => {
          add(picked)
          setPicking(null)
        }}
        onAdded={onExerciseAdded}
      />
    </>
  )
}
