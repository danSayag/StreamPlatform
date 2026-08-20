import { isExpired, loadSession } from './session'

/** Thrown when the server accepted the token but the account may not do this. */
export class ForbiddenError extends Error {
  constructor(message = 'Your account does not have access to this.') {
    super(message)
    this.name = 'ForbiddenError'
  }
}

/** Thrown when the session is missing or no longer valid. */
export class UnauthorizedError extends Error {
  constructor(message = 'Your session has expired. Please sign in again.') {
    super(message)
    this.name = 'UnauthorizedError'
  }
}

// Set by AuthProvider so a dead session can drop the whole app back to /signin from
// anywhere, including calls made outside a component.
let onSessionExpired: (() => void) | null = null

export const setSessionExpiredHandler = (handler: (() => void) | null) => {
  onSessionExpired = handler
}

/** Pulls {"message": "..."} off an error response, falling back to the status code. */
const messageOf = async (response: Response, fallback: string) => {
  try {
    const body = (await response.clone().json()) as { message?: string }
    if (body?.message) return body.message
  } catch {
    /* not JSON - fall through */
  }
  const text = await response.clone().text()
  return text || fallback
}

/**
 * The single entry point for every API call: attaches the bearer token and turns an
 * expired session into a redirect.
 */
export const apiFetch = async (path: string, init: RequestInit = {}) => {
  const session = loadSession()
  const headers = new Headers(init.headers)
  if (session) headers.set('Authorization', `Bearer ${session.token}`)

  const response = await fetch(path, { ...init, headers })

  if (response.ok) return response

  if (response.status === 401) {
    onSessionExpired?.()
    throw new UnauthorizedError(await messageOf(response, 'Your session has expired.'))
  }

  // Spring answers 403 both for "no usable token" and for "authenticated but lacks the
  // role". Only the first is a session problem - signing a ROLE_USER out because they
  // touched an admin endpoint would be a redirect loop, so the two are split here.
  if (response.status === 403) {
    if (!session || isExpired(session.token)) {
      onSessionExpired?.()
      throw new UnauthorizedError()
    }
    throw new ForbiddenError(await messageOf(response, 'You do not have access to this.'))
  }

  throw new Error(await messageOf(response, `Request failed: ${response.status}`))
}
