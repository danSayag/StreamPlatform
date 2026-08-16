import hero from '../assets/hero.png'
import { MovieGrid } from '../Movies/Movies'
import { useMovies } from '../lib/useMovies'
import type { NavKey } from '../Sidebar/Sidebar'

export const Home = ({ onNavigate }: { onNavigate: (key: NavKey) => void }) => {
  const { movies, error, loading } = useMovies()
  const featured = movies.slice(0, 5)

  return (
    <div>
      {/* Hero */}
      <section className='relative isolate overflow-hidden'>
        <img
          src={hero}
          alt=''
          aria-hidden='true'
          className='absolute inset-0 -z-10 h-full w-full object-cover opacity-40'
        />
        <div className='absolute inset-0 -z-10 bg-linear-to-t from-[#0c131a] via-[#0c131a]/70 to-transparent' />
        <div className='mx-auto flex min-h-[70vh] max-w-6xl flex-col justify-end px-6 py-16'>
          <p className='mb-3 text-sm font-semibold tracking-widest text-violet-400 uppercase'>
            Java + React
          </p>
          <h1 className='max-w-2xl text-4xl font-bold text-white sm:text-6xl'>
            Every movie in your library, one click away.
          </h1>
          <p className='mt-4 max-w-xl text-lg text-gray-300'>
            Browse the full catalog, save what you want to watch next, and pick up where you left
            off.
          </p>
          <div className='mt-8 flex flex-wrap gap-3'>
            <button
              type='button'
              onClick={() => onNavigate('movies')}
              className='rounded-lg bg-violet-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-violet-500'
            >
              Browse movies
            </button>
            <button
              type='button'
              onClick={() => onNavigate('myList')}
              className='rounded-lg bg-white/10 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/20'
            >
              My Lists
            </button>
          </div>
        </div>
      </section>

      {/* Featured row */}
      <section className='mx-auto max-w-6xl px-6 py-12'>
        <div className='mb-6 flex items-baseline justify-between'>
          <h2 className='text-xl font-bold text-white'>Trending now</h2>
          <button
            type='button'
            onClick={() => onNavigate('movies')}
            className='text-sm text-violet-400 transition hover:text-violet-300'
          >
            See all
          </button>
        </div>
        {loading && <p className='text-gray-400'>Loading movies...</p>}
        {error && <p className='text-red-400'>Could not reach the server on port 8080: {error}</p>}
        <MovieGrid movies={featured} />
      </section>
    </div>
  )
}
