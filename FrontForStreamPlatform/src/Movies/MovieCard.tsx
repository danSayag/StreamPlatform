import { useState } from 'react'
import { initialOf, posterOf, type Movie } from '../types'
import { ListPicker } from './ListPicker'

export const MovieCard = ({ movie }: { movie: Movie }) => {
  const poster = posterOf(movie)
  const [broken, setBroken] = useState(false)

  return (
    // Not overflow-hidden: the ListPicker dropdown has to escape the card.
    <div className='group relative rounded-lg bg-gray-800 shadow-lg transition hover:shadow-violet-900/40'>
      <ListPicker movie={movie} />

      <div className='aspect-2/3 w-full overflow-hidden rounded-t-lg'>
        {poster && !broken ? (
          <img
            src={poster}
            alt={movie.movieName}
            className='h-full w-full object-cover'
            onError={() => setBroken(true)}
          />
        ) : (
          <div className='flex h-full w-full items-center justify-center bg-linear-to-br from-violet-600 to-violet-900'>
            <span className='font-sans text-6xl font-bold text-white/90 select-none'>
              {initialOf(movie.movieName)}
            </span>
          </div>
        )}
      </div>

      <h2 className='truncate p-3 text-base font-bold text-white' title={movie.movieName}>
        {movie.movieName}
      </h2>
    </div>
  )
}
