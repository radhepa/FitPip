import { useState } from 'react'

interface Props {
  value: string
  /** Screen-reader label for the text box. */
  label: string
  /** The button that opens an empty note. */
  addText?: string
  placeholder?: string
  maxLength: number
  rows?: number
  onSave: (text: string) => void | Promise<void>
}

/**
 * A note that stays out of the way: "+ Add a note" until there is one, then a text box that saves when
 * you tap away.
 */
export function NoteField({ value, label, addText = 'Add a note', placeholder, maxLength, rows = 2, onSave }: Props) {
  const [draft, setDraft] = useState(value)
  const [open, setOpen] = useState(false)
  const [seen, setSeen] = useState(value)

  // A change that arrived from elsewhere (a sync) replaces the text unless it is being edited here.
  if (value !== seen) {
    setSeen(value)
    if (!open) setDraft(value)
  }

  if (!value && !open) {
    return (
      <button type="button" className="note-add" onClick={() => setOpen(true)}>
        + {addText}
      </button>
    )
  }

  return (
    <label className="block">
      <span className="sr-only">{label}</span>
      <textarea
        value={draft}
        rows={rows}
        maxLength={maxLength}
        autoFocus={open && !value}
        placeholder={placeholder ?? addText}
        onChange={(e) => setDraft(e.target.value)}
        onFocus={() => setOpen(true)}
        onBlur={() => {
          setOpen(false)
          if (draft.trim() !== value.trim()) void onSave(draft.trim())
        }}
        className="note-field"
      />
    </label>
  )
}
