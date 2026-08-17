import type { Movie } from '../types'
import { useMovies } from '../lib/useMovies'
import { MovieCard } from './MovieCard'

export const MovieGrid = ({ movies }: { movies: Movie[] }) => (
  <div className='grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5'>
    {movies.map((movie) => (
      <MovieCard key={movie.movieId} movie={movie} />
    ))}
  </div>
)

export const Movies = () => {
  const { movies, error, loading } = useMovies()

  return (
    <div className='mx-auto max-w-6xl px-6 py-10'>
      <h1 className='mb-8 text-2xl font-bold text-white'>Movies</h1>
      {loading && <p className='text-gray-400'>Loading movies...</p>}
      {error && <p className='text-red-400'>Could not reach the server on port 8080: {error}</p>}
      {!loading && !error && movies.length === 0 && (
        <p className='text-gray-400'>The server returned no movies.</p>
      )}
      <MovieGrid movies={movies} />
    </div>
  )
}
