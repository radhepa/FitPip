import type { ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'tint'

const STYLES: Record<Variant, string> = {
  primary: 'button-primary',
  secondary: 'button-secondary',
  danger: 'button-danger',
  ghost: 'button-ghost',
  tint: 'button-tint',
}

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  block?: boolean
  size?: 'md' | 'sm'
}

export function Button({ variant = 'secondary', block, size = 'md', className = '', type = 'button', ...rest }: Props) {
  return (
    <button
      type={type}
      className={`app-button ${STYLES[variant]} ${size === 'sm' ? 'button-sm' : ''} ${block ? 'w-full' : ''} ${className}`}
      {...rest}
    />
  )
}
