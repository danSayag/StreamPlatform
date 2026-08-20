import type { FormEvent, ReactNode } from 'react'
import { Link } from 'react-router-dom'

const FIELD_CLASS =
  'w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2.5 text-white placeholder-gray-500 outline-none transition focus:border-violet-500 focus:ring-1 focus:ring-violet-500'

export const Field = ({
  label,
  value,
  onChange,
  type = 'text',
  autoComplete,
  ...rest
}: {
  label: string
  value: string
  onChange: (value: string) => void
  type?: string
  autoComplete?: string
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'type'>) => (
  <label className='block'>
    <span className='mb-1.5 block text-sm font-medium text-gray-300'>{label}</span>
    <input
      className={FIELD_CLASS}
      type={type}
      value={value}
      autoComplete={autoComplete}
      onChange={(event) => onChange(event.target.value)}
      {...rest}
    />
  </label>
)

/** Shared card, heading, error banner and submit button for the two auth pages. */
export const AuthShell = ({
  title,
  subtitle,
  error,
  submitLabel,
  pending,
  onSubmit,
  footer,
  children,
}: {
  title: string
  subtitle: string
  error: string | null
  submitLabel: string
  pending: boolean
  onSubmit: (event: FormEvent) => void
  footer: ReactNode
  children: ReactNode
}) => (
  <div className='flex min-h-screen items-center justify-center px-6 py-12'>
    <div className='w-full max-w-sm'>
      <Link to='/' className='mb-8 block text-center text-xl font-bold tracking-tight text-violet-400'>
        StreamPlatform
      </Link>

      <div className='rounded-2xl border border-gray-800 bg-[#0f1720] p-8'>
        <h1 className='text-2xl font-bold text-white'>{title}</h1>
        <p className='mt-1.5 mb-6 text-sm text-gray-400'>{subtitle}</p>

        {error && (
          <p
            role='alert'
            className='mb-5 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2.5 text-sm text-red-300'
          >
            {error}
          </p>
        )}

        <form onSubmit={onSubmit} className='space-y-4'>
          {children}
          <button
            type='submit'
            disabled={pending}
            className='w-full rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-60'
          >
            {pending ? 'Please wait...' : submitLabel}
          </button>
        </form>

        <p className='mt-6 text-center text-sm text-gray-400'>{footer}</p>
      </div>
    </div>
  </div>
)
