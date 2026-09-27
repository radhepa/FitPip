import { useMemo, useState } from 'react'
import { deleteSet, logSet, restoreSet, updateSet, type SetPatch } from '../data/sets'
import { useEarlierSets } from '../hooks/useEarlierSets'
import type { usePendingExercises } from '../hooks/usePendingExercises'
import { useLastSessionSets } from '../hooks/useLastSessionSets'
import { useRestTimer } from '../hooks/useRestTimer'
import { defaultTarget, SECTION_INFO, sectionOf, type Section } from '../lib/activity'
import { bestsOf, recordSetIds } from '../lib/liveRecords'
import { addManyToPlan, removeFromPlan, setPlanNote } from '../lib/sessionPlan'
import { buildBlocks, bySection, type PlanItem } from '../lib/workoutBlocks'
import type { Category, DistanceUnit, Exercise, SetRow, WeightUnit } from '../types/db'
import { Button } from './Button'
import { CardioQuickAdd } from './CardioQuickAdd'
import { ExerciseBlock, type NewEntry } from './ExerciseBlock'
import { ExercisePicker } from './ExercisePicker'
import { buzz, confetti } from './fx'
import { RestTimer } from './RestTimer'
import { SectionHeader } from './SectionHeader'
import { UndoToast } from './UndoToast'

interface Props {
  sessionId: string
  /** When this workout began (records are measured against earlier workouts). */
  startedAt: string | null
  plan: PlanItem[]
  sets: SetRow[]
  exercises: Exercise[]
  unit: WeightUnit
  distanceUnit: DistanceUnit
  pending: ReturnType<typeof usePendingExercises>
  /** Runs a write and shows any failure in the banner instead of throwing into the UI. */
  guard: (action: () => Promise<void>) => Promise<void>
  onSetsChange: (update: (prev: SetRow[]) => SetRow[]) => void
  onPlanChange: (plan: PlanItem[]) => void
  onExerciseAdded: (exercise: Exercise) => void
  /** Editing a finished workout: no rest timer, and "delete" instead of "discard". */
  editing?: boolean
  onDiscard: () => void
}

/** A workout under way, in sections (strength, cardio, yoga & stretching), each exercise logged its own way. */
export function ActiveWorkout({ sessionId, startedAt, plan, sets, exercises, unit, distanceUnit, pending, guard, onSetsChange, onPlanChange, onExerciseAdded, editing = false, onDiscard }: Props) {
  const [picking, setPicking] = useState<Category | 'all' | null>(null)
  const restTimer = useRestTimer()
  const [undo, setUndo] = useState<{ set: SetRow; key: number } | null>(null)
  const exerciseById = useMemo(() => new Map(exercises.map((e) => [e.id, e])), [exercises])
  const blocks = useMemo(
    () => buildBlocks({ sets, pendingIds: pending.ids, plan }).filter((b) => exerciseById.has(b.exerciseId)),
    [sets, pending.ids, plan, exerciseById],
  )
  const sections = useMemo(() => bySection(blocks, (b) => sectionOf(exerciseById.get(b.exerciseId)!)), [blocks, exerciseById])
  const present = useMemo(() => new Set(blocks.map((b) => b.exerciseId)), [blocks])
  const lastSessionSets = useLastSessionSets(blocks.map((b) => b.exerciseId), sessionId)
  const earlierSets = useEarlierSets(blocks.map((b) => b.exerciseId), sessionId, startedAt)
  /** Sets in this workout that are personal records. */
  const records = useMemo(() => {
    const ids = new Set<string>()
    for (const block of blocks) {
      const exercise = exerciseById.get(block.exerciseId)
      const earlier = earlierSets[block.exerciseId]
      if (!exercise || !earlier) continue
      for (const id of recordSetIds(bestsOf(earlier, exercise), block.sets, exercise)) ids.add(id)
    }
    return ids
  }, [blocks, earlierSets, exerciseById])

  const add = (picked: Exercise[]) => onPlanChange(addManyToPlan(plan, picked.map((e) => ({ exerciseId: e.id, target: defaultTarget(e) }))))

  const onLog = (exercise: Exercise, entry: NewEntry) =>
    guard(async () => {
      const setOrder = sets.reduce((max, s) => Math.max(max, s.set_order), -1) + 1
      const row = await logSet({ sessionId, exerciseId: exercise.id, setOrder, ...entry })
      onSetsChange((prev) => [...prev, row])
      pending.remove(exercise.id)
      const earlier = earlierSets[exercise.id]
      const isRecord = !!earlier && recordSetIds(bestsOf(earlier, exercise), [...sets.filter((s) => s.exercise_id === exercise.id), row], exercise).has(row.id)
      if (isRecord) {
        buzz([20, 60, 40])
        confetti(70)
      } else buzz(15)
      if (exercise.tracking === 'reps' && !editing) restTimer.start()
    })

  const onEditSet = (setId: string, patch: Partial<SetPatch>) =>
    guard(async () => {
      const row = await updateSet(setId, patch)
      onSetsChange((prev) => prev.map((s) => (s.id === setId ? row : s)))
    })

  const onDeleteSet = (setId: string) =>
    guard(async () => {
      const removed = sets.find((s) => s.id === setId)
      await deleteSet(setId)
      onSetsChange((prev) => prev.filter((s) => s.id !== setId))
      if (removed) setUndo({ set: removed, key: Date.now() })
    })

  const onUndoDelete = () => {
    const removed = undo?.set
    setUndo(null)
    if (!removed) return
    void guard(async () => {
      const restored = await restoreSet(removed)
      onSetsChange((prev) => [...prev, restored].sort((a, b) => a.set_order - b.set_order || a.created_at.localeCompare(b.created_at)))
    })
  }

  const firstCategory = (section: Section): Category | 'all' => (section === 'strength' ? 'strength' : section === 'cardio' ? 'cardio' : SECTION_INFO[section].categories[0])
  let index = 0

  return (
    <>
      {sections.map(({ section, items }) => {
        if (items.length === 0 && section !== 'cardio' && blocks.length > 0) return null
        return (
          <div key={section}>
            <SectionHeader section={section} count={items.length} onAdd={() => setPicking(firstCategory(section))} />
            {section === 'cardio' && <CardioQuickAdd exercises={exercises} present={present} onAdd={(e) => add([e])} />}
            {items.length === 0 && section !== 'cardio' && <p className="card card-pad mb-3 border-dashed text-sm text-muted">Nothing here yet. Tap Add.</p>}
            <div className="stagger">
              {items.map((block) => {
                const exercise = exerciseById.get(block.exerciseId)!
                return (
                  <ExerciseBlock
                    key={block.exerciseId}
                    index={index++}
                    exercise={exercise}
                    sets={block.sets}
                    plan={block.plan}
                    unit={unit}
                    distanceUnit={distanceUnit}
                    lastSessionSets={lastSessionSets[block.exerciseId] ?? []}
                    records={records}
                    onLog={(entry) => onLog(exercise, entry)}
                    onEditSet={onEditSet}
                    onDeleteSet={onDeleteSet}
                    note={block.plan?.note ?? ''}
                    onNote={(text) => onPlanChange(setPlanNote(plan, block.exerciseId, text, defaultTarget(exercise)))}
                    onRemove={block.plan ? () => onPlanChange(removeFromPlan(plan, block.exerciseId)) : () => pending.remove(block.exerciseId)}
                  />
                )
              })}
            </div>
          </div>
        )
      })}

      <div className="mt-6 grid grid-cols-1 gap-2">
        <Button block onClick={() => setPicking('all')}>
          + Add anything
        </Button>
        <Button variant="ghost" block onClick={onDiscard} className="!text-danger">
          {editing ? 'Delete workout' : 'Discard workout'}
        </Button>
      </div>

      {undo && <UndoToast key={undo.key} message="Set deleted" raised={!!restTimer.rest} onUndo={onUndoDelete} onExpire={() => setUndo(null)} />}
      {/* Room to scroll past the floating rest timer, so the last buttons are never hidden behind it. */}
      {restTimer.rest && <div className="h-24" aria-hidden="true" />}
      {restTimer.rest && <RestTimer key={restTimer.rest.id} endsAt={restTimer.rest.endsAt} total={restTimer.rest.total} onChange={restTimer.change} onDone={restTimer.stop} />}

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
