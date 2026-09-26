import { useState, type FormEvent } from 'react'
import { errorMessage } from '../data/unwrap'
import { Button } from './Button'
import { inputClass } from './fieldStyles'

interface Props {
  onSubmit: (name: string) => Promise<void>
  onCancel: () => void
}

export function NewTemplateForm({ onSubmit, onCancel }: Props) {
  const [name, setName] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function submit(e: FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setBusy(true)
    setError(null)
    try {
      await onSubmit(name)
    } catch (err) {
      setError(errorMessage(err))
      setBusy(false)
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <label className="block">
        <span className="mb-1.5 block text-sm font-semibold text-muted">Routine name</span>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={80}
          placeholder="e.g. Push day, Swim + stretch"
          required
          autoFocus
          className={inputClass}
        />
      </label>
      {error && <p className="text-sm text-danger">{error}</p>}
      <div className="grid grid-cols-1 gap-2 min-[360px]:grid-cols-2">
        <Button onClick={onCancel} disabled={busy}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" disabled={busy || !name.trim()}>
          {busy ? 'Creating…' : 'Create'}
        </Button>
      </div>
    </form>
  )
}
