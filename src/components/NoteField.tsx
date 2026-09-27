import { useEffect, useRef, useState } from 'react'
import { usePendingEdit } from '../hooks/usePendingEdit'

interface Props {
  /** Screen-reader label for the text box. */
  label: string
  /** The button that opens an empty note. */
  addText?: string
  value: string
  placeholder?: string
  maxLength: number
  rows?: number
  onSave: (text: string) => void | Promise<void>
}

/** Saves this long after typing stops. Also saves when you tap away or leave the screen. */
const SAVE_AFTER_MS = 700

/**
 * A note that stays out of the way: "+ Add a note" until there is one, then a text box. It saves by
 * itself (a moment after you stop typing, on blur, and when the screen closes), because on a phone
 * tapping a button doesn't always take focus away from the box, so blur alone would lose the note.
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

  // Always the latest, for the timer and the leave-the-screen save.
  const latest = useRef({ draft, value, onSave })
  useEffect(() => {
    latest.current = { draft, value, onSave }
  })

  const saveIfChanged = () => {
    const { draft: text, value: saved, onSave: save } = latest.current
    return text.trim() !== saved.trim() ? save(text.trim()) : undefined
  }
  // Finish right after typing a note: the note is saved (and on the summary) before the workout closes.
  usePendingEdit(saveIfChanged)

  useEffect(() => {
    if (draft.trim() === value.trim()) return
    const timer = setTimeout(() => void saveIfChanged(), SAVE_AFTER_MS)
    return () => clearTimeout(timer)
  }, [draft, value])

  useEffect(() => () => void saveIfChanged(), [])

  if (!value && !open && !draft) {
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
          void saveIfChanged()
        }}
        className="note-field"
      />
    </label>
  )
}
