import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ErrorBoundary } from './components/ErrorBoundary'
import { RESET_PATH } from './data/auth'
import { watchForUpdates } from './lib/appUpdate'
import { parseRecoveryHash } from './lib/recoveryLink'

// A screen chunk from an older deploy can be gone after an update: reload onto the new version.
window.addEventListener('vite:preloadError', (event) => {
  event.preventDefault()
  window.location.reload()
})

if (import.meta.env.PROD) watchForUpdates()

// A password-reset link that landed anywhere else (e.g. Supabase fell back to the site's home page)
// still opens the reset screen.
if (window.location.pathname !== RESET_PATH && parseRecoveryHash(window.location.hash)) {
  window.history.replaceState(null, '', RESET_PATH + window.location.hash)
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary scope="app">
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
