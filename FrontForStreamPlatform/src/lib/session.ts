export type Session = {
  token: string
  username: string
  role: string
}

const STORAGE_KEY = 'streamplatform.session'

/**
 * Reads the `exp` claim without verifying the signature. Only ever used to avoid sending a
 * token we already know is stale - the server remains the sole authority on whether a
 * token is acceptable.
 */
export const expiryOf = (token: string): number | null => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1])) as { exp?: number }
    return typeof payload.exp === 'number' ? payload.exp * 1000 : null
  } catch {
    return null
  }
}

export const isExpired = (token: string) => {
  const expiry = expiryOf(token)
  return expiry !== null && expiry <= Date.now()
}

export const loadSession = (): Session | null => {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return null

  try {
    const session = JSON.parse(raw) as Session
    // A token that has already lapsed is worth nothing; drop it rather than letting the
    // UI render a signed-in shell that 403s on every request.
    if (!session.token || isExpired(session.token)) {
      localStorage.removeItem(STORAGE_KEY)
      return null
    }
    return session
  } catch {
    localStorage.removeItem(STORAGE_KEY)
    return null
  }
}

export const saveSession = (session: Session) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
}

export const clearSession = () => {
  localStorage.removeItem(STORAGE_KEY)
}
