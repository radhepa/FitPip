import { reduceMotion } from './fx'

/**
 * Plays a sheet's exit. Call it from a layout-effect cleanup while the sheet is still in the page:
 * it copies the sheet, and once React has removed the real one, slides the copy away and drops it.
 * Works whether the parent closed the sheet or simply stopped rendering it, so no caller changes.
 */
export function playSheetExit(root: HTMLElement): void {
  if (reduceMotion()) return
  const ghost = root.cloneNode(true) as HTMLElement
  // Scroll positions are gone once the node leaves the page, so note them now.
  const from = [...root.querySelectorAll<HTMLElement>('*')]
  const scrolls = from.map((el) => el.scrollTop)

  queueMicrotask(() => {
    if (root.isConnected) return // not really leaving (e.g. React's strict-mode practice run)
    ghost.classList.add('sheet-leaving')
    ghost.setAttribute('aria-hidden', 'true')
    ghost.inert = true
    const panel = ghost.querySelector<HTMLElement>('.sheet-panel')
    // Only the live sheet is a dialog, for anything that looks one up while the copy is leaving.
    panel?.removeAttribute('role')
    panel?.removeAttribute('aria-modal')
    // A drag leaves inline animation/transition behind; the exit keyframes take over from its position.
    panel?.style.removeProperty('animation')
    panel?.style.removeProperty('transition')
    document.body.appendChild(ghost)

    const to = ghost.querySelectorAll<HTMLElement>('*')
    from.forEach((el, i) => {
      const copy = to[i]
      if (!copy) return
      if (scrolls[i]) copy.scrollTop = scrolls[i]
      if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement || el instanceof HTMLSelectElement) {
        ;(copy as HTMLInputElement).value = el.value
      }
    })

    const remove = () => ghost.remove()
    panel?.addEventListener('animationend', remove, { once: true })
    window.setTimeout(remove, 450)
  })
}
