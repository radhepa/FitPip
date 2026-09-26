import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { BackIcon } from './icons'

interface Props {
  title: string
  subtitle?: string
  /** Small coloured line above the title. */
  eyebrow?: string
  back?: boolean
  action?: ReactNode
}

export function PageHeader({ title, subtitle, eyebrow, back, action }: Props) {
  const navigate = useNavigate()
  return (
    <header className="page-header">
      <div className="min-w-0">
        {back && (
          <button type="button" onClick={() => navigate(-1)} className="back-button">
            <BackIcon size="size-5" /> Back
          </button>
        )}
        {eyebrow && <span className="page-eyebrow">{eyebrow}</span>}
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {action}
    </header>
  )
}
