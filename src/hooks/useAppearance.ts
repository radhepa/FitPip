import { useEffect, useState } from 'react'

export type AppearancePreference = 'auto' | 'light' | 'dark'

const STORAGE_KEY = 'fitpip.appearance'
const DARK_QUERY = '(prefers-color-scheme: dark)'

function storedPreference(): AppearancePreference {
  const value = localStorage.getItem(STORAGE_KEY)
  return value === 'light' || value === 'dark' ? value : 'auto'
}

function resolvedTheme(preference: AppearancePreference): 'light' | 'dark' {
  if (preference !== 'auto') return preference
  return window.matchMedia(DARK_QUERY).matches ? 'dark' : 'light'
}

function applyTheme(preference: AppearancePreference) {
  const theme = resolvedTheme(preference)
  const root = document.documentElement
  root.dataset.theme = theme
  root.style.colorScheme = theme
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#070b14' : '#f3f6fc')
  document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]')?.setAttribute('content', theme === 'dark' ? 'black-translucent' : 'default')
}

export function useAppearance() {
  const [preference, setPreferenceState] = useState<AppearancePreference>(storedPreference)

  useEffect(() => {
    const media = window.matchMedia(DARK_QUERY)
    const update = () => applyTheme(preference)
    update()
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [preference])

  function setPreference(value: AppearancePreference) {
    localStorage.setItem(STORAGE_KEY, value)
    applyTheme(value)
    setPreferenceState(value)
  }

  return { preference, setPreference }
}
