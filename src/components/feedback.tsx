import type { ReactNode } from 'react'
import { errorMessage } from '../data/unwrap'

/**
 * Shimmering placeholders shaped like the cards that are coming. They fade in after a short pause, so a
 * quick read never flashes them for a frame before the real content.
 */
export function Loading({ label = 'Loading…', rows = 3 }: { label?: string; rows?: number }) {
  return (
    <div role="status" aria-label={label} className="loading-reveal grid grid-cols-1 gap-3 py-2">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="skeleton h-20" style={{ opacity: 1 - i * 0.2 }} />
      ))}
    </div>
  )
}

export function ErrorBanner({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  if (!error) return null
  const message = error instanceof Error ? errorMessage(error) : String(error)
  return (
    <div role="alert" className="card my-3 border-danger/40 p-4 text-sm text-danger">
      <p>{message}</p>
      {onRetry && (
        <button type="button" onClick={onRetry} className="mt-2 font-bold underline">
          Try again
        </button>
      )}
    </div>
  )
}

export function EmptyState({ title, children, art }: { title: string; children?: ReactNode; art?: ReactNode }) {
  return (
    <div className="card card-pad flex items-center gap-4 border-dashed">
      {art}
      <div className="min-w-0">
        <p className="font-bold">{title}</p>
        {children && <div className="mt-1 max-w-lg text-sm text-muted">{children}</div>}
      </div>
    </div>
  )
}
