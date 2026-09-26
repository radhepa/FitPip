import { muscleLabel } from '../lib/format'
import { MUSCLES, type Muscle } from '../types/db'
import { Chip } from './Chip'

interface Props {
  label: string
  value: Muscle[]
  onChange: (value: Muscle[]) => void
  /** Muscles already chosen elsewhere, hidden so one muscle can't be both primary and secondary. */
  hide?: Muscle[]
}

export function MusclePicker({ label, value, onChange, hide = [] }: Props) {
  const toggle = (m: Muscle) => onChange(value.includes(m) ? value.filter((v) => v !== m) : [...value, m])
  return (
    <fieldset>
      <legend className="mb-1 text-sm text-muted">{label}</legend>
      <div className="flex flex-wrap gap-2">
        {MUSCLES.filter((m) => !hide.includes(m)).map((m) => (
          <Chip key={m} label={muscleLabel(m)} selected={value.includes(m)} onClick={() => toggle(m)} />
        ))}
      </div>
    </fieldset>
  )
}
