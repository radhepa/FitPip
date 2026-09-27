import { buzz } from './fx'
import { RepeatButton } from './RepeatButton'

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
  /**
   * For two steppers side by side. On a phone each gets too little width for the number between the
   * buttons ("202.5" is cut off), so there the number gets the full width and − / + sit under it.
   */
  stackOnPhone?: boolean
}

/** A big number field with − and + buttons either side (hold one to keep stepping). */
export function Stepper({ label, value, onChange, onStep, inputMode = 'decimal', placeholder = '0', invalid, ariaLabel, stackOnPhone = false }: Props) {
  const step = (direction: -1 | 1) => {
    buzz(6)
    onStep(direction)
  }
  // Phone-width tweaks only when asked for; the 440 px breakpoint is where two steppers stop fitting.
  const rowClass = stackOnPhone ? 'flex items-center gap-1 max-[440px]:grid max-[440px]:grid-cols-2 max-[440px]:gap-1.5' : 'flex items-center gap-1'
  const buttonClass = stackOnPhone ? 'icon-button !size-10 max-[440px]:!h-11 max-[440px]:!w-full max-[440px]:!rounded-xl' : 'icon-button !size-10'
  const inputClass = stackOnPhone
    ? 'min-h-11 w-full min-w-0 border-0 bg-transparent text-center font-display text-[1.6rem] font-extrabold outline-none max-[440px]:order-first max-[440px]:col-span-2'
    : 'min-h-11 w-full min-w-0 border-0 bg-transparent text-center font-display text-[1.6rem] font-extrabold outline-none'

  return (
    <div className={`rounded-2xl border bg-bg p-1.5 ${invalid ? 'border-danger' : 'border-line'}`}>
      <span className="block pt-0.5 text-center text-[.7rem] font-bold tracking-wide text-muted uppercase">{label}</span>
      <div className={rowClass}>
        <RepeatButton className={buttonClass} onStep={() => step(-1)} aria-label={`Less ${label.toLowerCase()}`}>
          −
        </RepeatButton>
        <input
          inputMode={inputMode}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={(e) => e.target.select()}
          placeholder={placeholder}
          aria-label={ariaLabel ?? label}
          aria-invalid={invalid}
          className={inputClass}
        />
        <RepeatButton className={buttonClass} onStep={() => step(1)} aria-label={`More ${label.toLowerCase()}`}>
          +
        </RepeatButton>
      </div>
    </div>
  )
}
