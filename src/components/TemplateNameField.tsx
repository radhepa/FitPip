import { useState } from 'react'
import { usePendingEdit } from '../hooks/usePendingEdit'
import { inputClass } from './fieldStyles'

interface Props {
  name: string
  onRename: (name: string) => void | Promise<void>
}

/** The template's name as an always-editable field; saves when it loses focus. */
export function TemplateNameField({ name, onRename }: Props) {
  const [draft, setDraft] = useState(name)
  // Start can come before the field loses focus (iPhone): it saves the typed name first.
  usePendingEdit(() => {
    const next = draft.trim()
    return next && next !== name ? onRename(next) : undefined
  })

  return (
    <label className="mb-5 block">
      <span className="mb-1.5 block text-sm font-semibold text-muted">Name</span>
      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => {
          const next = draft.trim()
          if (!next) return setDraft(name) // a routine needs a name
          if (next !== name) onRename(next)
        }}
        maxLength={80}
        aria-label="Routine name"
        className={inputClass}
      />
    </label>
  )
}
