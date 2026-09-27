import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props {
  children: ReactNode
  /** `screen`: one page failed, the tab bar still works. `app`: nothing else is up, so a bare page. */
  scope?: 'screen' | 'app'
}

interface State {
  error: Error | null
}

/**
 * Catches a crash while drawing a screen, so one bug shows a way out instead of blanking the whole
 * app (which, installed on a phone, meant force-closing it). Nothing on the device is lost: all data
 * is already saved by the time anything is drawn.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: unknown): State {
    return { error: error instanceof Error ? error : new Error(String(error)) }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Screen crashed', error, info.componentStack)
  }

  render() {
    const { error } = this.state
    if (!error) return this.props.children
    const reload = () => window.location.reload()

    if (this.props.scope === 'app') {
      return (
        <div role="alert" className="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-4 p-6">
          <h1 className="font-display text-3xl font-extrabold">Something went wrong</h1>
          <p className="text-muted">Your workouts are saved on this device. Reloading usually fixes it.</p>
          <button type="button" className="app-button button-primary" onClick={reload}>
            Reload
          </button>
        </div>
      )
    }

    return (
      <div role="alert" className="card card-pad mt-4">
        <p className="font-display text-xl font-extrabold">This screen hit a snag</p>
        <p className="mt-1 text-sm text-muted">Your data is safe. Try again, or head back to Today.</p>
        <p className="mt-2 truncate text-xs text-muted">{error.message}</p>
        <div className="mt-4 grid grid-cols-3 gap-2">
          <button type="button" className="app-button button-primary button-sm" onClick={() => this.setState({ error: null })}>
            Try again
          </button>
          <a href="/" className="app-button button-secondary button-sm">
            Today
          </a>
          <button type="button" className="app-button button-secondary button-sm" onClick={reload}>
            Reload
          </button>
        </div>
      </div>
    )
  }
}
