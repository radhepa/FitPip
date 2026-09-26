import { buzz } from './fx'

interface Props {
  label: string
  value: string
  onChange: (value: string) => void
  /** Called by the − and + buttons. */
  onStep: (direction: -1 | 1) => void
  inputMode?: 'decimal' | 'numeric' | 'text'
  placeholder?: string
  invalid?: boolean
  ariaLabel?: string
}

/** A big number field with − and + buttons either side. */
export function Stepper({ label, value, onChange, onStep, inputMode = 'decimal', placeholder = '0', invalid, ariaLabel }: Props) {
  const step = (direction: -1 | 1) => {
    buzz(6)
    onStep(direction)
  }
  return (
    <div className={`rounded-2xl border bg-bg p-1.5 ${invalid ? 'border-danger' : 'border-line'}`}>
      <span className="block pt-0.5 text-center text-[.7rem] font-bold tracking-wide text-muted uppercase">{label}</span>
      <div className="flex items-center gap-1">
        <button type="button" className="icon-button !size-10" onClick={() => step(-1)} aria-label={`Less ${label.toLowerCase()}`}>
          −
        </button>
        <input
          inputMode={inputMode}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={(e) => e.target.select()}
          placeholder={placeholder}
          aria-label={ariaLabel ?? label}
          aria-invalid={invalid}
          className="min-h-11 w-full min-w-0 border-0 bg-transparent text-center font-display text-[1.6rem] font-extrabold outline-none"
        />
        <button type="button" className="icon-button !size-10" onClick={() => step(1)} aria-label={`More ${label.toLowerCase()}`}>
          +
        </button>
      </div>
    </div>
  )
}
