import { useState, type FormEvent } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { AuthShell, Field } from './AuthShell'
import { useAuth } from './useAuth'

/** Admins land on the admin panel; everyone else on the catalog home. */
const homeFor = (role: string) => (role === 'ROLE_ADMIN' ? '/admin' : '/')

export const SignIn = () => {
  const { signIn, isAuthenticated, session } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  // Wherever ProtectedRoute bounced them off, if anywhere.
  const requested = (location.state as { from?: { pathname: string } } | null)?.from?.pathname

  if (isAuthenticated && session) {
    return <Navigate to={requested ?? homeFor(session.role)} replace />
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError(null)
    setPending(true)
    try {
      const next = await signIn({ username, password })
      navigate(requested ?? homeFor(next.role), { replace: true })
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setPending(false)
    }
  }

  return (
    <AuthShell
      title='Sign in'
      subtitle='Use your StreamPlatform account to continue.'
      error={error}
      submitLabel='Sign in'
      pending={pending}
      onSubmit={handleSubmit}
      footer={
        <>
          No account yet?{' '}
          <Link to='/signup' className='font-medium text-violet-400 hover:text-violet-300'>
            Create one
          </Link>
        </>
      }
    >
      <Field
        label='Username'
        value={username}
        onChange={setUsername}
        autoComplete='username'
        required
        autoFocus
      />
      <Field
        label='Password'
        type='password'
        value={password}
        onChange={setPassword}
        autoComplete='current-password'
        required
      />
    </AuthShell>
  )
}
