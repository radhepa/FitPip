import { useState } from 'react'
import { usePendingEdit } from '../hooks/usePendingEdit'
import { inputClass } from './fieldStyles'

interface Props {
  name: string
  onRename: (name: string) => void | Promise<void>
}

/** The template's name as an always-editable field; saves when it loses focus. */
export function TemplateNameField({ name, onRename }: Props) {
  // Null until something is typed, so the saved name shows (and a rename from elsewhere is never undone).
  const [draft, setDraft] = useState<string | null>(null)
  const rename = () => {
    if (draft === null) return undefined
    const next = draft.trim()
    if (!next || next === name) {
      setDraft(null) // an empty name goes back to the saved one: a routine needs a name
      return undefined
    }
    // Keep showing what was typed until the save lands, then follow the saved name again.
    return Promise.resolve(onRename(next)).then(() => setDraft((current) => (current === draft ? null : current)))
  }
  // Start can come before the field loses focus (iPhone): it saves the typed name first.
  usePendingEdit(rename)

  return (
    <label className="mb-5 block">
      <span className="mb-1.5 block text-sm font-semibold text-muted">Name</span>
      <input
        value={draft ?? name}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => void rename()}
        maxLength={80}
        aria-label="Routine name"
        className={inputClass}
      />
    </label>
  )
}
