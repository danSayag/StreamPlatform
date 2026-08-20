import { createContext } from 'react'
import type { Session } from '../lib/session'

export type Credentials = { username: string; password: string }

export type AuthContextValue = {
  session: Session | null
  isAuthenticated: boolean
  isAdmin: boolean
  // Both resolve with the new session: the caller needs the role to pick a landing page,
  // and the context value it would read is still the pre-login one on that tick.
  signIn: (credentials: Credentials) => Promise<Session>
  signUp: (credentials: Credentials) => Promise<Session>
  signOut: () => void
}

// Kept out of AuthContext.tsx so that file exports only the provider component, which is
// what React Fast Refresh needs to hot-reload it.
export const AuthContext = createContext<AuthContextValue | null>(null)
