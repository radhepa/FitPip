import { REST_MAX, REST_MIN, REST_PRESETS, restText, stepRest } from '../lib/rest'

interface Props {
  /** 0 = off. */
  seconds: number
  disabled?: boolean
  onChange: (seconds: number) => void
}

/** Settings control for the rest timer: on/off, a − / + stepper, and a few quick picks. */
export function RestSetting({ seconds, disabled, onChange }: Props) {
  const on = seconds > 0
  return (
    <div className="grid grid-cols-1 gap-3">
      <div className="segmented" role="group" aria-label="Rest timer">
        <button type="button" aria-pressed={on} disabled={disabled} onClick={() => !on && onChange(90)}>
          On
        </button>
        <button type="button" aria-pressed={!on} disabled={disabled} onClick={() => on && onChange(0)}>
          Off
        </button>
      </div>

      {on && (
        <>
          <div className="flex items-center gap-2 rounded-2xl border border-line bg-bg p-1.5">
            <button type="button" className="icon-button" disabled={disabled || seconds <= REST_MIN} aria-label="Shorter rest" onClick={() => onChange(stepRest(seconds, -1))}>
              −
            </button>
            <p className="flex-1 text-center font-display text-3xl font-extrabold tabular-nums" aria-live="polite" aria-label={`Rest length ${restText(seconds)}`}>
              {restText(seconds)}
            </p>
            <button type="button" className="icon-button" disabled={disabled || seconds >= REST_MAX} aria-label="Longer rest" onClick={() => onChange(stepRest(seconds, 1))}>
              +
            </button>
          </div>
          <div className="grid grid-cols-4 gap-2" role="group" aria-label="Quick picks">
            {REST_PRESETS.map((preset) => (
              <button key={preset} type="button" className="filter-chip justify-center" aria-pressed={seconds === preset} disabled={disabled} onClick={() => onChange(preset)}>
                {restText(preset)}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
