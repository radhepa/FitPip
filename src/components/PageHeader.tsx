import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { BackIcon } from './icons'

interface Props {
  title: string
  subtitle?: string
  /** Small coloured line above the title. */
  eyebrow?: string
  back?: boolean
  /** Where Back goes when there is no earlier page in the app to return to (opened fresh, after a reload). */
  backTo?: string
  action?: ReactNode
}

export function PageHeader({ title, subtitle, eyebrow, back, backTo = '/', action }: Props) {
  const navigate = useNavigate()
  const goBack = () => {
    // React Router numbers the entries it creates; 0 means this page is the first one in the app.
    const idx = (window.history.state as { idx?: number } | null)?.idx ?? 0
    if (idx > 0) navigate(-1)
    else navigate(backTo, { replace: true })
  }
  return (
    <header className="page-header">
      <div className="min-w-0">
        {back && (
          <button type="button" onClick={goBack} className="back-button">
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
