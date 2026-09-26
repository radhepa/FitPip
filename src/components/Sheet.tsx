import { useEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

interface Props {
  open: boolean
  title: string
  onClose: () => void
  children: ReactNode
  /** Pinned under the scrolling content (for a sheet's main action). */
  footer?: ReactNode
}

/** Bottom sheet modal that springs up from the bottom edge. */
export function Sheet({ open, title, onClose, children, footer }: Props) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = previous
    }
  }, [open, onClose])

  if (!open) return null

  // Rendered on <body> so it always sits above the page (and the tab bar), whatever the page's stacking.
  return createPortal(
    <div className="sheet-backdrop fixed inset-0 z-50 flex items-end justify-center bg-black/60" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
        className="sheet-panel flex max-h-[90dvh] w-full max-w-xl flex-col rounded-t-[1.75rem] border border-line bg-surface"
      >
        <div className="mx-auto mt-2.5 h-1.5 w-10 shrink-0 rounded-full bg-line-strong/60" aria-hidden="true" />
        <div className="flex shrink-0 items-center justify-between px-4 pt-2 pb-1">
          <h2 className="font-display text-xl font-extrabold">{title}</h2>
          <button type="button" aria-label="Close" onClick={onClose} className="icon-button">
            ×
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-4 pt-2 pb-4">{children}</div>
        {footer && <div className="shrink-0 border-t border-line px-4 pt-3 pb-[calc(env(safe-area-inset-bottom)+1rem)]">{footer}</div>}
        {!footer && <div className="shrink-0 pb-[env(safe-area-inset-bottom)]" />}
      </div>
    </div>,
    document.body,
  )
}
