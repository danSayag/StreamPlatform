import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { setSessionExpiredHandler } from '../lib/api'
import { clearSession, loadSession, saveSession, type Session } from '../lib/session'
import { AuthContext, type AuthContextValue, type Credentials } from './context'

const AUTH_BASE = '/api/v1/auth'

/**
 * Auth calls bypass apiFetch: they carry no token, and a 401 here means "wrong password"
 * to show inline, not a dead session to redirect on.
 */
const postCredentials = async (path: string, credentials: Credentials): Promise<Session> => {
  const response = await fetch(`${AUTH_BASE}/${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  })

  const body = (await response.json().catch(() => null)) as
    | (Session & { message?: string })
    | null

  if (!response.ok) {
    throw new Error(body?.message ?? `Request failed: ${response.status}`)
  }
  if (!body?.token) {
    throw new Error('The server did not return a token.')
  }
  return { token: body.token, username: body.username, role: body.role }
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(() => loadSession())

  const signOut = useCallback(() => {
    clearSession()
    setSession(null)
  }, [])

  // Lets apiFetch tear down the session from anywhere, including outside React.
  useEffect(() => {
    setSessionExpiredHandler(signOut)
    return () => setSessionExpiredHandler(null)
  }, [signOut])

  const authenticate = useCallback(async (path: string, credentials: Credentials) => {
    const next = await postCredentials(path, credentials)
    saveSession(next)
    setSession(next)
    return next
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      isAuthenticated: session !== null,
      isAdmin: session?.role === 'ROLE_ADMIN',
      signIn: (credentials) => authenticate('login', credentials),
      signUp: (credentials) => authenticate('signup', credentials),
      signOut,
    }),
    [session, authenticate, signOut],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
