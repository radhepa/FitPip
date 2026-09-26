import { useState } from 'react'
import { WEEK_ORDER, WEEKDAY_NAMES, WEEKDAY_SHORT } from '../lib/weekPlan'
import { Button } from './Button'
import { Sheet } from './Sheet'

interface Props {
  from: number | null
  onClose: () => void
  onCopy: (from: number, to: number[]) => Promise<void>
}

/** Copy one day's lineup onto other days (anything already there is kept). */
export function CopyDaySheet({ from, onClose, onCopy }: Props) {
  const [to, setTo] = useState<number[]>([])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const close = () => {
    setTo([])
    setError(null)
    onClose()
  }

  async function copy() {
    if (from === null) return
    setBusy(true)
    setError(null)
    try {
      await onCopy(from, to)
      close()
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setBusy(false)
    }
  }

  return (
    <Sheet
      open={from !== null}
      title={from === null ? '' : `Copy ${WEEKDAY_NAMES[from]} to…`}
      onClose={close}
      footer={
        <>
          {error && <p className="mb-2 text-sm text-danger">{error}</p>}
          <Button variant="primary" block disabled={to.length === 0 || busy} onClick={copy}>
            {busy ? 'Copying…' : to.length === 0 ? 'Pick days' : `Copy to ${to.length} ${to.length === 1 ? 'day' : 'days'}`}
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-7 gap-1.5">
        {WEEK_ORDER.filter((d) => d !== from).map((d) => {
          const on = to.includes(d)
          return (
            <button
              key={d}
              type="button"
              aria-pressed={on}
              onClick={() => setTo((prev) => (on ? prev.filter((x) => x !== d) : [...prev, d]))}
              className={`min-h-14 cursor-pointer rounded-2xl border text-sm font-extrabold transition-colors ${on ? 'border-transparent text-on-accent' : 'border-line bg-surface-2 text-muted'}`}
              style={on ? { background: 'var(--grad-accent)' } : undefined}
            >
              {WEEKDAY_SHORT[d]}
            </button>
          )
        })}
      </div>
      <p className="mt-3 text-sm text-muted">Everything on {from === null ? '' : WEEKDAY_NAMES[from]} is added to the days you pick. What they already have stays.</p>
    </Sheet>
  )
}
