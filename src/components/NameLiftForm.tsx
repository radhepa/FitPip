import { useState, type FormEvent } from 'react'
import { errorMessage } from '../data/unwrap'
import { Button } from './Button'
import { inputClass } from './fieldStyles'

/** A lift can be planned with just a name; exercises can be added later. */
export function NameLiftForm({ onAdd }: { onAdd: (name: string) => Promise<void> }) {
  const [name, setName] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function submit(event: FormEvent) {
    event.preventDefault()
    if (busy || !name.trim()) return
    setBusy(true)
    setError(null)
    try {
      await onAdd(name.trim())
    } catch (e) {
      setError(errorMessage(e))
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={submit} className="mb-4 space-y-3 border-b border-line pb-4">
      <label className="block">
        <span className="mb-1.5 block text-sm font-bold">Name the lift</span>
        <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Push, Pull, Upper, Lower" maxLength={80} required disabled={busy} />
      </label>
      <p className="text-sm text-muted">Just a name is enough. Add exercises later if you want.</p>
      {error && <p role="alert" className="text-sm text-danger">{error}</p>}
      <Button type="submit" variant="primary" block disabled={busy || !name.trim()}>
        {busy ? 'Adding…' : 'Add lift'}
      </Button>
    </form>
  )
}
