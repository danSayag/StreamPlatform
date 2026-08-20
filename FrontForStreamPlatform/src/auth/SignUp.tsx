import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { AuthShell, Field } from './AuthShell'
import { useAuth } from './useAuth'

// Mirrors the server-side minimums in AuthController, so the obvious mistakes are caught
// before a round trip. The server still enforces them.
const MIN_USERNAME_LENGTH = 3
const MIN_PASSWORD_LENGTH = 8

export const SignUp = () => {
  const { signUp, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  if (isAuthenticated) return <Navigate to='/' replace />

  const validate = () => {
    if (username.trim().length < MIN_USERNAME_LENGTH) {
      return `Username must be at least ${MIN_USERNAME_LENGTH} characters.`
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      return `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`
    }
    if (password !== confirmation) return 'The two passwords do not match.'
    return null
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    const problem = validate()
    if (problem) {
      setError(problem)
      return
    }

    setError(null)
    setPending(true)
    try {
      // Signup returns a token, so a new account lands straight in the app.
      await signUp({ username: username.trim(), password })
      navigate('/', { replace: true })
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setPending(false)
    }
  }

  return (
    <AuthShell
      title='Create account'
      subtitle='Sign up to browse the catalog.'
      error={error}
      submitLabel='Create account'
      pending={pending}
      onSubmit={handleSubmit}
      footer={
        <>
          Already have an account?{' '}
          <Link to='/signin' className='font-medium text-violet-400 hover:text-violet-300'>
            Sign in
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
        autoComplete='new-password'
        required
      />
      <Field
        label='Confirm password'
        type='password'
        value={confirmation}
        onChange={setConfirmation}
        autoComplete='new-password'
        required
      />
    </AuthShell>
  )
}
