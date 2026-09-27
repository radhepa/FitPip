import { useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../components/Button'
import { PageHeader } from '../components/PageHeader'
import { RestSetting } from '../components/RestSetting'
import { SyncCard } from '../components/SyncCard'
import { Toast } from '../components/Toast'
import { signOut } from '../data/auth'
import { loadStarterExercises } from '../data/exercises'
import { exportEverything, exportWeighIns, exportWorkouts, type ExportFile } from '../data/export'
import { hasUnsyncedChanges } from '../data/sync/actions'
import { getSyncStatus } from '../data/sync/status'
import { errorMessage } from '../data/unwrap'
import { useAuth } from '../hooks/useAuth'
import { useAppearance, type AppearancePreference } from '../hooks/useAppearance'
import { useSettings } from '../hooks/useSettings'
import { countOf } from '../lib/format'
import { saveFile } from '../lib/saveFile'
import type { DistanceUnit, WeightUnit } from '../types/db'

const APPEARANCES: { value: AppearancePreference; label: string }[] = [
  { value: 'auto', label: 'Auto' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
]

function Group<T extends string>({ label, options, value, onChange, disabled }: { label: string; options: { value: T; label: string }[]; value: T; onChange: (v: T) => void; disabled?: boolean }) {
  return (
    <div className="segmented" role="group" aria-label={label}>
      {options.map((o) => (
        <button key={o.value} type="button" aria-pressed={o.value === value} disabled={disabled} onClick={() => onChange(o.value)}>
          {o.label}
        </button>
      ))}
    </div>
  )
}

function Card({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
  return (
    <section className="card p-4">
      <h2 className="mb-3 font-display text-lg font-extrabold">{title}</h2>
      {children}
      {hint && <p className="mt-2 text-xs text-muted">{hint}</p>}
    </section>
  )
}

export function SettingsScreen() {
  const { session } = useAuth()
  const { preference, setPreference } = useAppearance()
  const { unit, setUnit, distanceUnit, setDistanceUnit, restSeconds, setRestSeconds } = useSettings()
  const [message, setMessage] = useState<{ text: string; key: number } | null>(null)
  const [busy, setBusy] = useState(false)

  const exportFile = (make: () => Promise<ExportFile>) =>
    run(async () => {
      const file = await make()
      return (await saveFile(file)) ? `Saved ${file.name}.` : ''
    })

  async function run(action: () => Promise<string>) {
    setBusy(true)
    setMessage(null)
    try {
      const text = await action()
      if (text) setMessage({ text, key: Date.now() })
    } catch (e) {
      setMessage({ text: errorMessage(e), key: Date.now() })
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <PageHeader back title="Settings" />
      {message && <Toast key={message.key} message={message.text} onDone={() => setMessage(null)} />}
      <div className="stagger grid grid-cols-1 gap-3 lg:grid-cols-2">
        <SyncCard />

        <Card title="Starting rank" hint="Answer five exercise questions to estimate your starting rank. Your logged workouts stay as they are.">
          <Link to="/welcome" state={{ returnTo: '/settings' }} className="app-button button-secondary w-full">Retake fitness assessment</Link>
        </Card>

        <Card title="Appearance" hint="Auto follows this device.">
          <Group label="Appearance" options={APPEARANCES} value={preference} onChange={setPreference} />
        </Card>

        <Card title="Weight unit" hint="Lifts you've already logged are not converted. Weigh-ins are.">
          <Group<WeightUnit>
            label="Weight unit"
            options={[{ value: 'lb', label: 'Pounds (lb)' }, { value: 'kg', label: 'Kilograms (kg)' }]}
            value={unit}
            disabled={busy}
            onChange={(u) => run(async () => { await setUnit(u); return `Weight unit set to ${u}.` })}
          />
        </Card>

        <Card title="Distance unit" hint="Swims show yards with miles, and metres with kilometres.">
          <Group<DistanceUnit>
            label="Distance unit"
            options={[{ value: 'mi', label: 'Miles' }, { value: 'km', label: 'Kilometres' }]}
            value={distanceUnit}
            disabled={busy}
            onChange={(u) => run(async () => { await setDistanceUnit(u); return `Distance unit set to ${u === 'mi' ? 'miles' : 'kilometres'}.` })}
          />
        </Card>

        <Card title="Rest timer" hint="The countdown after each lifting set. You can still add or trim time on one rest without changing this.">
          <RestSetting
            seconds={restSeconds}
            disabled={busy}
            onChange={(seconds) => run(async () => { await setRestSeconds(seconds); return '' })}
          />
        </Card>

        <Card title="Exercise bank" hint="Adds any starter lifts and activities (runs, swims, yoga poses, stretches, boxing) you're missing. Your own are untouched.">
          <Button
            block
            disabled={busy}
            onClick={() =>
              run(async () => {
                const added = await loadStarterExercises()
                return added === 0 ? 'You already have every starter exercise.' : `Added ${countOf(added, 'starter exercise or activity', 'starter exercises and activities')}.`
              })
            }
          >
            Load starter exercises
          </Button>
        </Card>

        <Card title="Your data" hint="Spreadsheet files (CSV) of every set and weigh-in, or a full copy of everything to keep.">
          <div className="grid grid-cols-1 gap-2 min-[400px]:grid-cols-2">
            <Button disabled={busy} onClick={() => exportFile(() => exportWorkouts(unit))}>
              Workouts (CSV)
            </Button>
            <Button disabled={busy} onClick={() => exportFile(exportWeighIns)}>
              Weigh-ins (CSV)
            </Button>
            <Button className="min-[400px]:col-span-2" disabled={busy} onClick={() => exportFile(exportEverything)}>
              Full backup (JSON)
            </Button>
          </div>
        </Card>

        <Card title="Account">
          <p className="mb-3 truncate text-sm text-muted">{session?.user.email ?? 'Guest'}</p>
          <Button variant="danger" block disabled={busy} onClick={() =>
              run(async () => {
                const { pending, failed } = getSyncStatus()
                const waiting = pending + failed
                if (hasUnsyncedChanges() && !window.confirm(`${countOf(waiting, 'change')} ${waiting === 1 ? "hasn't" : "haven't"} synced yet. ${waiting === 1 ? 'It stays' : 'They stay'} on this device and sync the next time you sign in here. Sign out anyway?`)) return ''
                await signOut()
                return ''
              })
            }>
            Sign out
          </Button>
        </Card>
      </div>
    </>
  )
}
