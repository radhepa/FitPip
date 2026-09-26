import { useState } from 'react'
import { MAX_DISPLAY_NAME } from '../data/settings'
import { errorMessage } from '../data/unwrap'
import { useSettings } from '../hooks/useSettings'
import type { Sex } from '../types/db'
import { Button } from './Button'
import { SEX_OPTIONS } from './ProfileSetupCard'
import { Sheet } from './Sheet'

/** Name on the profile and which strength standards lifts are ranked against. */
export function ProfileEditSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  // Mounted only while open, so the form starts from the saved values every time.
  return open ? <EditForm onClose={onClose} /> : null
}

function EditForm({ onClose }: { onClose: () => void }) {
  const { displayName, compareSex, setDisplayName, setCompareSex } = useSettings()
  const [name, setName] = useState(displayName ?? '')
  const [sex, setSex] = useState<Sex | null>(compareSex)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  async function save() {
    setSaving(true)
    setError(null)
    try {
      if (name.trim() !== (displayName ?? '')) await setDisplayName(name)
      if (sex && sex !== compareSex) await setCompareSex(sex)
      onClose()
    } catch (e) {
      setError(errorMessage(e))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Sheet
      open
      title="Edit profile"
      onClose={onClose}
      footer={
        <Button variant="primary" block disabled={saving} onClick={save}>
          {saving ? 'Saving…' : 'Save'}
        </Button>
      }
    >
      <label className="block">
        <span className="mb-1.5 block text-sm font-extrabold">Name</span>
        <input className="field" value={name} maxLength={MAX_DISPLAY_NAME} autoComplete="nickname" placeholder="What should Pip call you?" onChange={(e) => setName(e.target.value)} />
      </label>

      <div className="mt-5">
        <p className="mb-1.5 text-sm font-extrabold">Compare my lifts with</p>
        <div className="segmented" role="group" aria-label="Strength standards">
          {SEX_OPTIONS.map((o) => (
            <button key={o.value} type="button" aria-pressed={sex === o.value} onClick={() => setSex(o.value)}>
              {o.label}
            </button>
          ))}
        </div>
        <p className="mt-2 text-xs text-muted">Strength and pace standards differ between men and women; pick the ones you want to be measured against.</p>
      </div>
      {error && <p className="mt-3 text-sm text-danger">{error}</p>}
    </Sheet>
  )
}
