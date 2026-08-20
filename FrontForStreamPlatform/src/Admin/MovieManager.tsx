import { useEffect, useState, type FormEvent } from 'react'
import type { CategoryOption, MovieDraft } from '../lib/useMovieAdmin'
import { labelOf } from '../lib/categories'
import type { Movie } from '../types'

const INPUT_CLASS =
  'rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-white placeholder-gray-500 outline-none transition focus:border-violet-500 focus:ring-1 focus:ring-violet-500'

const emptyDraft = (options: CategoryOption[]): MovieDraft => ({
  movieName: '',
  category: options[0]?.value ?? '',
  posterUrl: '',
  videoPath: '',
})

/**
 * Create/edit form. Doubles as the "add" row and the inline editor for an existing movie -
 * the only difference is which id gets submitted.
 */
const MovieForm = ({
  options,
  initial,
  submitLabel,
  onSubmit,
  onCancel,
}: {
  options: CategoryOption[]
  initial: MovieDraft
  submitLabel: string
  onSubmit: (draft: MovieDraft) => Promise<boolean>
  onCancel?: () => void
}) => {
  const [draft, setDraft] = useState(initial)
  const [saving, setSaving] = useState(false)

  // useState only reads `initial` on the first render, and the admin panel mounts this
  // form before the category list has loaded - so without this the add row keeps the
  // empty category it started with and posts category:"", which the server rejects.
  useEffect(() => {
    if (options.length > 0) {
      setDraft((current) => (current.category ? current : { ...current, category: options[0].value }))
    }
  }, [options])

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!draft.movieName.trim() || saving) return
    setSaving(true)
    const ok = await onSubmit(draft)
    setSaving(false)
    // Only reset on a create (no cancel handler); an edit closes itself.
    if (ok && !onCancel) setDraft(emptyDraft(options))
  }

  return (
    <form onSubmit={handleSubmit} className='space-y-2'>
      <div className='flex flex-wrap items-center gap-2'>
      <input
        value={draft.movieName}
        onChange={(event) => setDraft({ ...draft, movieName: event.target.value })}
        placeholder='Movie name'
        aria-label='Movie name'
        className={`${INPUT_CLASS} min-w-0 flex-1`}
      />
      <select
        value={draft.category}
        onChange={(event) => setDraft({ ...draft, category: event.target.value })}
        aria-label='Category'
        className={INPUT_CLASS}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <button
        type='submit'
        disabled={saving || !draft.movieName.trim() || !draft.category}
        className='rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-50'
      >
        {saving ? 'Saving…' : submitLabel}
      </button>
      {onCancel && (
        <button
          type='button'
          onClick={onCancel}
          className='rounded-lg px-3 py-2 text-sm font-medium text-gray-400 transition hover:text-white'
        >
          Cancel
        </button>
      )}
      </div>

      {/* Both optional: a movie with neither still saves, it just shows a placeholder and
          reports that nothing is attached when opened. */}
      <div className='flex flex-wrap items-center gap-2'>
        <input
          value={draft.posterUrl}
          onChange={(event) => setDraft({ ...draft, posterUrl: event.target.value })}
          placeholder='Poster, e.g. poster/kiss.png (optional)'
          aria-label='Poster image path or URL'
          className={`${INPUT_CLASS} min-w-0 flex-1`}
        />
        <input
          value={draft.videoPath}
          onChange={(event) => setDraft({ ...draft, videoPath: event.target.value })}
          placeholder='Video, e.g. video/kiss.mp4 (optional)'
          aria-label='Video file path'
          className={`${INPUT_CLASS} min-w-0 flex-1`}
        />
      </div>
    </form>
  )
}

export const MovieManager = ({
  movies,
  options,
  loading,
  error,
  save,
}: {
  movies: Movie[]
  options: CategoryOption[]
  loading: boolean
  error: string | null
  save: (draft: MovieDraft, movieId?: number) => Promise<boolean>
}) => {
  const [editingId, setEditingId] = useState<number | null>(null)

  return (
    <section className='rounded-xl border border-gray-800 bg-[#0f1720] p-6'>
      <h2 className='mb-1 text-base font-semibold text-white'>Movies</h2>
      <p className='mb-5 text-sm text-gray-500'>
        Add a title or edit an existing one. Names must be unique. Poster and video paths
        are relative to the server's media library.
      </p>

      {error && (
        <p
          role='alert'
          className='mb-5 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2.5 text-sm text-red-300'
        >
          {error}
        </p>
      )}

      <div className='mb-6 rounded-lg border border-dashed border-gray-700 p-4'>
        <MovieForm
          options={options}
          initial={emptyDraft(options)}
          submitLabel='Add movie'
          onSubmit={(draft) => save(draft)}
        />
      </div>

      {loading ? (
        <p className='text-sm text-gray-500'>Loading movies…</p>
      ) : movies.length === 0 ? (
        <p className='text-sm text-gray-500'>No movies yet.</p>
      ) : (
        <ul className='divide-y divide-gray-800'>
          {movies.map((movie) => (
            <li key={movie.movieId} className='py-3'>
              {editingId === movie.movieId ? (
                <MovieForm
                  options={options}
                  initial={{
                    movieName: movie.movieName,
                    category: movie.category ?? '',
                    posterUrl: movie.posterUrl ?? '',
                    videoPath: movie.videoPath ?? '',
                  }}
                  submitLabel='Save'
                  onCancel={() => setEditingId(null)}
                  onSubmit={async (draft) => {
                    const ok = await save(draft, movie.movieId)
                    if (ok) setEditingId(null)
                    return ok
                  }}
                />
              ) : (
                <div className='flex items-center gap-4'>
                  <span className='min-w-0 flex-1 truncate text-sm text-white'>
                    {movie.movieName}
                  </span>
                  <span className='shrink-0 rounded-full bg-white/5 px-2.5 py-1 text-xs text-gray-400'>
                    {movie.category ? labelOf(movie.category) : 'Uncategorised'}
                  </span>
                  <button
                    type='button'
                    onClick={() => setEditingId(movie.movieId)}
                    className='shrink-0 text-sm text-violet-400 transition hover:text-violet-300'
                  >
                    Edit
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
