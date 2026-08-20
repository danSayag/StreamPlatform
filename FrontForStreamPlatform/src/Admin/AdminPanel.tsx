import { Link } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import { labelOf } from '../lib/categories'
import { expiryOf } from '../lib/session'
import { useLists } from '../lib/useLists'
import { useMovieAdmin } from '../lib/useMovieAdmin'
import type { Movie } from '../types'
import { MovieManager } from './MovieManager'

const Tile = ({
  label,
  value,
  hint,
}: {
  label: string
  value: string | number
  hint?: string
}) => (
  <div className='rounded-xl border border-gray-800 bg-[#0f1720] p-5'>
    <p className='text-sm font-medium text-gray-400'>{label}</p>
    {/* Hero number: the tile's whole job is one magnitude, so no plot. */}
    <p className='mt-2 text-3xl font-bold text-white tabular-nums'>{value}</p>
    {hint && <p className='mt-1 text-xs text-gray-500'>{hint}</p>}
  </div>
)

/**
 * Counts per category. One series, so one hue - the colour carries magnitude, not
 * identity, and the row labels carry identity. No legend, and every bar is directly
 * labelled, so nothing is encoded by colour alone.
 */
const CategoryBars = ({ counts }: { counts: [string, number][] }) => {
  const max = Math.max(...counts.map(([, count]) => count), 1)

  return (
    <div className='space-y-2'>
      {counts.map(([category, count]) => (
        <div key={category} className='group grid grid-cols-[8rem_1fr_2.5rem] items-center gap-3'>
          <span className='truncate text-sm text-gray-400'>{labelOf(category)}</span>
          {/* Recessive track; the fill is anchored left and rounded only on the data end. */}
          <span
            className='h-5 rounded-sm bg-white/5'
            title={`${labelOf(category)}: ${count} titles`}
          >
            <span
              className='block h-full rounded-r-sm bg-violet-500 transition group-hover:bg-violet-400'
              style={{ width: `${(count / max) * 100}%` }}
            />
          </span>
          <span className='text-right text-sm text-gray-300 tabular-nums'>{count}</span>
        </div>
      ))}
    </div>
  )
}

/** Every category gets a row, including the empty ones, so adding the first title to a
 *  category is visible rather than making a row appear from nowhere. */
const countByCategory = (movies: Movie[], categories: string[]): [string, number][] => {
  const tally = new Map(categories.map((category) => [category, 0]))
  for (const movie of movies) {
    if (movie.category) tally.set(movie.category, (tally.get(movie.category) ?? 0) + 1)
  }
  return [...tally.entries()].sort((a, b) => b[1] - a[1])
}

export const AdminPanel = () => {
  const { session } = useAuth()
  // One source of truth for movies: the counts and the chart move as soon as a write lands.
  const { movies, options, loading, error, save } = useMovieAdmin()
  const { lists, error: listsError } = useLists()

  const counts = countByCategory(movies, options.map((option) => option.value))
  const used = counts.filter(([, count]) => count > 0).length
  const expiry = session ? expiryOf(session.token) : null

  return (
    <div className='mx-auto max-w-6xl px-6 py-10'>
      <header className='mb-8'>
        <h1 className='text-2xl font-bold text-white'>Admin panel</h1>
        <p className='mt-1 text-sm text-gray-400'>
          Signed in as <span className='text-gray-200'>{session?.username}</span> with full
          administrator access.
        </p>
      </header>

      <section className='mb-10 grid grid-cols-1 gap-4 sm:grid-cols-3'>
        <Tile label='Movies' value={loading ? '—' : movies.length} hint='Titles in the catalog' />
        <Tile
          label='Categories'
          value={loading ? '—' : `${used} / ${options.length}`}
          hint='In use / available'
        />
        <Tile
          label='Custom lists'
          value={listsError ? '—' : lists.length}
          hint={listsError ? 'Unavailable' : 'Admin-managed lists'}
        />
      </section>

      <section className='mb-10 rounded-xl border border-gray-800 bg-[#0f1720] p-6'>
        <h2 className='mb-1 text-base font-semibold text-white'>Catalog by category</h2>
        <p className='mb-5 text-sm text-gray-500'>Number of titles in each category.</p>
        {loading ? (
          <p className='text-sm text-gray-500'>Loading breakdown…</p>
        ) : counts.length === 0 ? (
          <p className='text-sm text-gray-500'>No categories to show.</p>
        ) : (
          <CategoryBars counts={counts} />
        )}
      </section>

      <div className='mb-10'>
        <MovieManager
          movies={movies}
          options={options}
          loading={loading}
          error={error}
          save={save}
        />
      </div>

      <section className='grid grid-cols-1 gap-4 md:grid-cols-2'>
        <div className='rounded-xl border border-gray-800 bg-[#0f1720] p-6'>
          <h2 className='mb-4 text-base font-semibold text-white'>Session</h2>
          <dl className='space-y-3 text-sm'>
            <div className='flex justify-between gap-4'>
              <dt className='text-gray-400'>Username</dt>
              <dd className='text-gray-200'>{session?.username}</dd>
            </div>
            <div className='flex justify-between gap-4'>
              <dt className='text-gray-400'>Role</dt>
              <dd className='text-gray-200'>{session?.role}</dd>
            </div>
            <div className='flex justify-between gap-4'>
              <dt className='text-gray-400'>Token expires</dt>
              <dd className='text-gray-200'>
                {expiry ? new Date(expiry).toLocaleString() : 'Unknown'}
              </dd>
            </div>
          </dl>
        </div>

        <div className='rounded-xl border border-gray-800 bg-[#0f1720] p-6'>
          <h2 className='mb-4 text-base font-semibold text-white'>Manage</h2>
          <div className='flex flex-wrap gap-3'>
            <Link
              to='/admin/new'
              className='rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-500'
            >
              Add a movie
            </Link>
            <Link
              to='/my-lists'
              className='rounded-lg bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/20'
            >
              Custom lists
            </Link>
            <Link
              to='/browse'
              className='rounded-lg bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/20'
            >
              Browse catalog
            </Link>
          </div>
          {listsError && (
            <p className='mt-4 text-xs text-gray-500'>Lists could not be loaded: {listsError}</p>
          )}
        </div>
      </section>
    </div>
  )
}
