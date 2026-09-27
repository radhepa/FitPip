import { useEffect, useLayoutEffect, useRef } from 'react'

type Save = () => unknown

const pending = new Set<{ current: Save }>()

/**
 * Registers a field's "save what has been typed" while it is on screen. Fields save on blur, but on
 * iPhone tapping a button doesn't take the focus off a field, so a button that acts on the saved data
 * (Begin, Finish, Start) calls `saveAllEdits()` first.
 */
export function usePendingEdit(save: Save): void {
  const ref = useRef(save)
  useLayoutEffect(() => {
    ref.current = save
  })
  useEffect(() => {
    pending.add(ref)
    return () => {
      pending.delete(ref)
    }
  }, [])
}

/**
 * Saves every field with unsaved typing, one after another (letting the screen catch up in between, so
 * each builds on the last), and waits for those saves.
 */
export async function saveAllEdits(): Promise<void> {
  for (const edit of [...pending]) {
    try {
      await edit.current()
    } catch {
      // the field shows its own error; carry on with the rest
    }
    await new Promise((resolve) => setTimeout(resolve, 0))
  }
}
