import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Check } from 'lucide-react'
import { useMovieAdmin, type MovieDraft } from '../lib/useMovieAdmin'

const INPUT_CLASS =
  'w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2.5 text-sm text-white placeholder-gray-500 outline-none transition focus:border-violet-500 focus:ring-1 focus:ring-violet-500'

/**
 * Full-page create form. The same POST /movies the inline row in MovieManager uses - this
 * one just gives it room for a label, a description and a confirmation.
 */
export const CreateMovie = () => {
  const navigate = useNavigate()
  // Also the source of the category list: /movies/category-options is fetched here.
  const { options, loading, error, save, setError } = useMovieAdmin()

  const [draft, setDraft] = useState<MovieDraft>({
    movieName: '',
    category: '',
    posterUrl: '',
    videoPath: '',
  })
  const [saving, setSaving] = useState(false)
  const [created, setCreated] = useState<string | null>(null)

  // The select cannot default to a category until the options land.
  useEffect(() => {
    if (options.length > 0) {
      setDraft((current) => (current.category ? current : { ...current, category: options[0].value }))
    }
  }, [options])

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!draft.movieName.trim() || saving) return

    setSaving(true)
    const ok = await save(draft)
    setSaving(false)

    if (ok) {
      setCreated(draft.movieName.trim())
      // Cleared rather than navigating away, so adding several in a row is one screen.
      setDraft({ movieName: '', category: options[0]?.value ?? '', posterUrl: '', videoPath: '' })
    }
  }

  return (
    <div className='mx-auto max-w-2xl px-6 py-10'>
      <Link
        to='/admin'
        className='mb-6 inline-flex items-center gap-2 text-sm text-gray-400 transition hover:text-white'
      >
        <ArrowLeft size={16} strokeWidth={1.5} aria-hidden />
        Admin panel
      </Link>

      <header className='mb-8'>
        <h1 className='text-2xl font-bold text-white'>Add a movie</h1>
        <p className='mt-1 text-sm text-gray-400'>
          The server assigns the id. Names must be unique across the catalog.
        </p>
      </header>

      {created && (
        <p
          role='status'
          className='mb-6 flex items-center gap-2 rounded-lg border border-violet-500/30 bg-violet-500/10 px-3 py-2.5 text-sm text-violet-200'
        >
          <Check size={16} strokeWidth={2} aria-hidden className='shrink-0' />
          “{created}” was added to the catalog.
        </p>
      )}

      {error && (
        <p
          role='alert'
          className='mb-6 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2.5 text-sm text-red-300'
        >
          {error}
        </p>
      )}

      <form
        onSubmit={handleSubmit}
        className='space-y-5 rounded-xl border border-gray-800 bg-[#0f1720] p-6'
      >
        <div>
          <label htmlFor='movieName' className='mb-1.5 block text-sm font-medium text-gray-300'>
            Movie name
          </label>
          <input
            id='movieName'
            value={draft.movieName}
            onChange={(event) => {
              // A stale error under a form the admin is already fixing reads as a new failure.
              if (error) setError(null)
              if (created) setCreated(null)
              setDraft({ ...draft, movieName: event.target.value })
            }}
            placeholder='e.g. Blade Runner'
            className={INPUT_CLASS}
          />
        </div>

        <div>
          <label htmlFor='category' className='mb-1.5 block text-sm font-medium text-gray-300'>
            Category
          </label>
          <select
            id='category'
            value={draft.category}
            onChange={(event) => setDraft({ ...draft, category: event.target.value })}
            disabled={loading || options.length === 0}
            className={`${INPUT_CLASS} disabled:cursor-not-allowed disabled:opacity-50`}
          >
            {loading && <option>Loading categories…</option>}
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <p className='mt-1.5 text-xs text-gray-500'>
            Values come from the Category enum, so this list cannot drift from the server.
          </p>
        </div>

        <div>
          <label htmlFor='posterUrl' className='mb-1.5 block text-sm font-medium text-gray-300'>
            Poster image URL <span className='text-gray-500'>(optional)</span>
          </label>
          <input
            id='posterUrl'
            value={draft.posterUrl}
            onChange={(event) => setDraft({ ...draft, posterUrl: event.target.value })}
            placeholder='poster/kiss.png'
            className={INPUT_CLASS}
          />
          <p className='mt-1.5 text-xs text-gray-500'>
            A file inside the server's media library, or a full https:// URL. Left empty,
            the card falls back to the title's first letter.
          </p>
        </div>

        <div>
          <label htmlFor='videoPath' className='mb-1.5 block text-sm font-medium text-gray-300'>
            Video file <span className='text-gray-500'>(optional)</span>
          </label>
          <input
            id='videoPath'
            value={draft.videoPath}
            onChange={(event) => setDraft({ ...draft, videoPath: event.target.value })}
            placeholder='video/kiss.mp4'
            className={INPUT_CLASS}
          />
          <p className='mt-1.5 text-xs text-gray-500'>
            A file inside the server's media library. The server streams it, so anything
            resolving outside that folder is refused.
          </p>
        </div>

        <div className='flex items-center gap-3 border-t border-gray-800 pt-5'>
          <button
            type='submit'
            disabled={saving || loading || !draft.movieName.trim()}
            className='rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-50'
          >
            {saving ? 'Creating…' : 'Create movie'}
          </button>
          <button
            type='button'
            onClick={() => navigate('/admin')}
            className='rounded-lg px-3 py-2.5 text-sm font-medium text-gray-400 transition hover:text-white'
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
