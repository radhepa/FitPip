import type { ButtonHTMLAttributes } from 'react'
import { useHoldRepeat } from '../hooks/useHoldRepeat'

interface Props extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onClick'> {
  /** Called once per tap, and over and over while held. */
  onStep: () => void
}

/** A − / + button: tap to step once, hold to keep stepping. */
export function RepeatButton({ onStep, className = '', ...rest }: Props) {
  const hold = useHoldRepeat(onStep)
  return <button type="button" {...rest} {...hold} className={`select-none ${className}`} />
}
