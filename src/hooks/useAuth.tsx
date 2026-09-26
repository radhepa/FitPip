import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { getAuthSession, onAuthChange, type AuthSession } from '../data/auth'

interface AuthValue {
  session: AuthSession | null
  /** True until the stored session (if any) has been read. */
  loading: boolean
}

const AuthContext = createContext<AuthValue>({ session: null, loading: true })

export function AuthProvider({ children }: { children: ReactNode }) {
  const [value, setValue] = useState<AuthValue>({ session: null, loading: true })

  useEffect(() => {
    let active = true
    getAuthSession()
      .then((session) => active && setValue({ session, loading: false }))
      .catch(() => active && setValue({ session: null, loading: false }))
    const unsubscribe = onAuthChange((session) => setValue({ session, loading: false }))
    return () => {
      active = false
      unsubscribe()
    }
  }, [])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
