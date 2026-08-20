import { useState } from 'react'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import { MovieGrid } from '../Movies/Movies'
import { labelOf } from '../lib/categories'
import { useMovieSearch } from '../lib/useMovieSearch'
import { useCategoryFilter } from '../lib/useCategoryFilter'

// Mirrors models/Category.java. Kept here so the chips render before any API call exists.
const CATEGORIES = ['DRAMA', 'SCI_FI', 'COMEDY', 'HORROR', 'ADVENTURE']

const ICON_PROPS = { size: 20, strokeWidth: 1.5, 'aria-hidden': true } as const

export const SearchPage = () => {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<string | null>(null)

  // Both hooks stay mounted, but each one no-ops on an empty input, so only the active
  // mode actually calls the server.
  const search = useMovieSearch(query)
  const filter = useCategoryFilter(category)

  // A chip wins over the text box: picking a category clears the query below, so the two
  // can never be active at once.
  const { results, error, loading } = category ? filter : search

  const searched = query.trim().length > 0
  const idle = !category && !searched

  return (
    <div className='mx-auto max-w-6xl px-6 py-10'>
      <h1 className='mb-8 text-2xl font-bold text-white'>Search</h1>

      {/* The hook searches as you type, so submitting is just a no-op that stops the
          browser reloading the page on Enter. */}
      <form onSubmit={(e) => e.preventDefault()} className='mb-6'>
        <div className='relative'>
          <Search
            {...ICON_PROPS}
            className='pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-gray-500'
          />
          <input
            value={query}
            onChange={(e) => {
              // The mirror of the chip handler: typing hands control back to the text box.
              setQuery(e.target.value)
              setCategory(null)
            }}
            placeholder='Search movies by title…'
            aria-label='Search movies'
            className='w-full rounded-xl bg-gray-800 py-3.5 pr-12 pl-12 text-base text-white placeholder-gray-500 outline-none transition focus:ring-1 focus:ring-violet-500'
          />
          {searched && (
            <button
              type='button'
              onClick={() => setQuery('')}
              aria-label='Clear search'
              className='absolute top-1/2 right-4 -translate-y-1/2 text-gray-500 transition hover:text-white'
            >
              <X {...ICON_PROPS} />
            </button>
          )}
        </div>
      </form>

      {/* Category chips. Purely visual for now — nothing filters yet. */}
      <div className='mb-8 flex flex-wrap items-center gap-2'>
        <SlidersHorizontal size={16} strokeWidth={1.5} aria-hidden className='mr-1 text-gray-500' />
        <button
          type='button'
          onClick={() => setCategory(null)}
          className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
            category === null
              ? 'bg-violet-600/20 text-violet-300'
              : 'bg-gray-800 text-gray-400 hover:text-white'
          }`}
        >
          All
        </button>
        {CATEGORIES.map((value) => (
          <button
            key={value}
            type='button'
            onClick={() => {
              // Clearing the query keeps one mode in charge and empties the text box, so
              // the UI matches the results being shown.
              setQuery('')
              setCategory(value === category ? null : value)
            }}
            className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
              value === category
                ? 'bg-violet-600/20 text-violet-300'
                : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            {labelOf(value)}
          </button>
        ))}
      </div>

      {error && (
        <p className='mb-6 rounded-lg border border-red-900 bg-red-950/40 px-4 py-3 text-sm text-red-300'>
          {error}
        </p>
      )}

      {loading ? (
        <p className='text-sm text-gray-500'>Searching…</p>
      ) : idle ? (
        <div className='rounded-lg border border-dashed border-gray-700 px-6 py-16 text-center'>
          <Search
            size={32}
            strokeWidth={1.5}
            aria-hidden
            className='mx-auto mb-3 text-gray-600'
          />
          <p className='text-gray-400'>Start typing to search the catalog.</p>
          <p className='mt-1 text-sm text-gray-500'>
            Close matches count too — spelling does not have to be exact.
          </p>
        </div>
      ) : results.length === 0 ? (
        <div className='rounded-lg border border-dashed border-gray-700 px-6 py-16 text-center'>
          <p className='text-gray-400'>
            {category ? `Nothing in ${labelOf(category)} yet.` : `No titles match “${query.trim()}”.`}
          </p>
          <p className='mt-1 text-sm text-gray-500'>
            {category ? 'Pick another category, or search by title.' : 'Try a shorter query or a different category.'}
          </p>
        </div>
      ) : (
        <>
          <p className='mb-4 text-sm text-gray-500'>
            {results.length} {results.length === 1 ? 'result' : 'results'}{' '}
            {category ? `in ${labelOf(category)}` : `for “${query.trim()}”`}
          </p>
          <MovieGrid movies={results} />
        </>
      )}
    </div>
  )
}
