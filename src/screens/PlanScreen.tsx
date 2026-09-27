import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AddToDaySheet } from '../components/AddToDaySheet'
import { Button } from '../components/Button'
import { CopyDaySheet } from '../components/CopyDaySheet'
import { DayCard } from '../components/DayCard'
import { EmptyState, ErrorBanner, Loading } from '../components/feedback'
import { NewTemplateForm } from '../components/NewTemplateForm'
import { PageHeader } from '../components/PageHeader'
import { PlanEntrySheet } from '../components/PlanEntrySheet'
import { Sheet } from '../components/Sheet'
import { TemplateListItem } from '../components/TemplateListItem'
import { PlusIcon } from '../components/icons'
import { listExercises } from '../data/exercises'
import { createTemplate, listTemplates } from '../data/templates'
import { errorMessage } from '../data/unwrap'
import { useAsync } from '../hooks/useAsync'
import { useNewWorkout } from '../hooks/useNewWorkout'
import { useWeekPlan } from '../hooks/useWeekPlan'
import { dayTargets, entriesForDay, entryName, entryPlan, WEEK_ORDER, type PlanEntry } from '../lib/weekPlan'

/** The week at a glance (any number of routines and activities per day) and the saved routines. */
export function PlanScreen() {
  const navigate = useNavigate()
  const templates = useAsync(listTemplates, [], { cacheKey: 'templates' })
  const exercises = useAsync(listExercises, [], { cacheKey: 'exercises' })
  const plan = useWeekPlan()
  const { create, creating } = useNewWorkout()
  const [creatingRoutine, setCreatingRoutine] = useState(false)
  const [addingTo, setAddingTo] = useState<number | null>(null)
  const [copyFrom, setCopyFrom] = useState<number | null>(null)
  const [openEntryId, setOpenEntryId] = useState<string | null>(null)

  const exerciseById = useMemo(() => new Map((exercises.data ?? []).map((e) => [e.id, e])), [exercises.data])
  const lookup = useMemo(() => ({ routines: templates.data ?? [], exercises: exercises.data ?? [] }), [templates.data, exercises.data])
  const items = useMemo(() => plan.items.data ?? [], [plan.items.data])
  const byDay = useMemo(() => new Map<number, PlanEntry[]>(WEEK_ORDER.map((d) => [d, entriesForDay(items, d, lookup)])), [items, lookup])
  const today = new Date().getDay()

  const openEntry: PlanEntry | null = useMemo(() => {
    for (const entries of byDay.values()) {
      const found = entries.find((e) => e.item.id === openEntryId)
      if (found) return found
    }
    return null
  }, [byDay, openEntryId])
  const dayOfOpen = openEntry ? (byDay.get(openEntry.item.weekday) ?? []) : []
  const openIndex = openEntry ? dayOfOpen.findIndex((e) => e.item.id === openEntry.item.id) : -1

  const loading = [templates, exercises, plan.items].some((s) => s.loading && !s.data)
  const loadError = templates.error ?? exercises.error ?? plan.items.error

  return (
    <>
      <PageHeader
        eyebrow="Your week"
        title="Plan"
        subtitle="Plan each day by kind of workout, lift name, routine, or single activity."
        action={
          <Button className="shrink-0" size="sm" onClick={() => setCreatingRoutine(true)}>
            <PlusIcon size="size-4" /> Routine
          </Button>
        }
      />

      {loading && <Loading rows={4} />}
      <ErrorBanner error={loadError} onRetry={() => { templates.reload(); exercises.reload(); plan.items.reload() }} />
      {plan.error && <p className="mb-3 text-sm text-danger">{plan.error}</p>}

      {!loading && !loadError && (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:items-start">
          <ul className="stagger m-0 grid list-none grid-cols-1 gap-2.5 p-0">
            {WEEK_ORDER.map((weekday, i) => (
              <DayCard
                key={weekday}
                index={i}
                weekday={weekday}
                entries={byDay.get(weekday) ?? []}
                exerciseById={exerciseById}
                isToday={weekday === today}
                onAdd={() => setAddingTo(weekday)}
                onCopy={() => setCopyFrom(weekday)}
                onOpenEntry={(entry) => setOpenEntryId(entry.item.id)}
              />
            ))}
          </ul>

          <section>
            <div className="section-heading">
              <h2>Routines</h2>
              <span className="text-sm font-semibold text-muted">{templates.data?.length ?? 0} saved</span>
            </div>
            {templates.data?.length === 0 ? (
              <EmptyState title="No routines yet">
                A routine is a saved list of exercises (like “Push day” or “Morning mobility”). Make one, then drop it on any day.
              </EmptyState>
            ) : (
              <div className="stagger grid grid-cols-1 gap-2.5">
                {templates.data?.map((item, i) => <TemplateListItem key={item.template.id} item={item} exerciseById={exerciseById} index={i} />)}
              </div>
            )}
          </section>
        </div>
      )}

      <AddToDaySheet
        key={addingTo ?? 'closed'}
        weekday={addingTo}
        routines={templates.data ?? []}
        exercises={exercises.data ?? []}
        existing={addingTo === null ? [] : dayTargets(items, addingTo)}
        onClose={() => setAddingTo(null)}
        onAdd={plan.add}
        onAddLift={async (weekday, name) => {
          // Reuse name-only lifts across days and after a failed calendar save.
          let lift = templates.data?.find((r) => r.items.length === 0 && r.template.name.toLowerCase() === name.toLowerCase())
          if (!lift) {
            lift = await createTemplate(name)
            const saved = lift
            templates.setData((prev) => [...(prev ?? []), saved])
          }
          await plan.add(weekday, [{ templateId: lift.template.id }])
        }}
        onNewRoutine={() => {
          setAddingTo(null)
          setCreatingRoutine(true)
        }}
      />
      <CopyDaySheet from={copyFrom} onClose={() => setCopyFrom(null)} onCopy={plan.copy} />
      <PlanEntrySheet
        entry={openEntry}
        exerciseById={exerciseById}
        isToday={openEntry?.item.weekday === today}
        canMoveUp={openIndex > 0}
        canMoveDown={openIndex >= 0 && openIndex < dayOfOpen.length - 1}
        busy={creating}
        onClose={() => setOpenEntryId(null)}
        onMove={(direction) => openEntry && plan.move(openEntry.item.id, direction)}
        onRemove={() => {
          if (openEntry) void plan.remove(openEntry.item.id)
          setOpenEntryId(null)
        }}
        onStart={() => {
          if (!openEntry) return
          void create(
            openEntry.kind === 'routine'
              ? { template: { id: openEntry.routine.template.id, name: openEntry.routine.template.name } }
              : openEntry.kind === 'category'
                ? { name: entryName(openEntry), pick: openEntry.category }
                : { name: entryName(openEntry), plan: entryPlan(openEntry) },
          )
        }}
      />

      <Sheet open={creatingRoutine} title="New routine" onClose={() => setCreatingRoutine(false)}>
        <NewTemplateForm
          onCancel={() => setCreatingRoutine(false)}
          onSubmit={async (name) => {
            try {
              const created = await createTemplate(name)
              navigate(`/plan/templates/${created.template.id}`)
            } catch (e) {
              throw new Error(errorMessage(e))
            }
          }}
        />
      </Sheet>
    </>
  )
}
