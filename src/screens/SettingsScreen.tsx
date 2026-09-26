import { useState, type ReactNode } from 'react'
import { Button } from '../components/Button'
import { PageHeader } from '../components/PageHeader'
import { SyncCard } from '../components/SyncCard'
import { signOut } from '../data/auth'
import { loadStarterExercises } from '../data/exercises'
import { hasUnsyncedChanges } from '../data/sync/actions'
import { getSyncStatus } from '../data/sync/status'
import { errorMessage } from '../data/unwrap'
import { useAuth } from '../hooks/useAuth'
import { useAppearance, type AppearancePreference } from '../hooks/useAppearance'
import { useSettings } from '../hooks/useSettings'
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
  const { unit, setUnit, distanceUnit, setDistanceUnit } = useSettings()
  const [message, setMessage] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function run(action: () => Promise<string>) {
    setBusy(true)
    setMessage(null)
    try {
      setMessage(await action())
    } catch (e) {
      setMessage(errorMessage(e))
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <PageHeader back title="Settings" />
      {message && <p className="card card-pad mb-3 text-sm">{message}</p>}
      <div className="stagger grid grid-cols-1 gap-3 lg:grid-cols-2">
        <SyncCard />

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

        <Card title="Exercise bank" hint="Adds any starter lifts and activities (runs, swims, yoga poses, stretches, boxing) you're missing. Your own are untouched.">
          <Button
            block
            disabled={busy}
            onClick={() =>
              run(async () => {
                const added = await loadStarterExercises()
                return added === 0 ? 'You already have every starter exercise.' : `Added ${added} starter exercises and activities.`
              })
            }
          >
            Load starter exercises
          </Button>
        </Card>

        <Card title="Account">
          <p className="mb-3 truncate text-sm text-muted">{session?.user.email ?? 'Guest'}</p>
          <Button variant="danger" block disabled={busy} onClick={() =>
              run(async () => {
                const { pending, failed } = getSyncStatus()
                const waiting = pending + failed
                if (hasUnsyncedChanges() && !window.confirm(`${waiting} change${waiting === 1 ? '' : 's'} haven't synced yet. They stay on this device and sync the next time you sign in here. Sign out anyway?`)) return ''
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
