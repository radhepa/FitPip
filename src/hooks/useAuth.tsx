import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { activateSession } from '../data/activate'
import { getAuthSession, onAuthChange, type AuthSession } from '../data/auth'

interface AuthValue {
  session: AuthSession | null
  /** True until the stored session (if any) has been read and its on-device data opened. */
  loading: boolean
}

const AuthContext = createContext<AuthValue>({ session: null, loading: true })

export function AuthProvider({ children }: { children: ReactNode }) {
  const [value, setValue] = useState<AuthValue>({ session: null, loading: true })

  useEffect(() => {
    let active = true
    let latest = 0

    /** Opens the right on-device data first, so screens never render before it is ready. */
    const apply = async (session: AuthSession | null) => {
      const mine = ++latest
      let ready = session
      try {
        await activateSession(session)
      } catch {
        ready = null // the device's storage could not be opened: treat as signed out
      }
      if (active && mine === latest) setValue({ session: ready, loading: false })
    }

    getAuthSession().then(apply).catch(() => apply(null))
    const unsubscribe = onAuthChange((session) => void apply(session))
    return () => {
      active = false
      unsubscribe()
    }
  }, [])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
