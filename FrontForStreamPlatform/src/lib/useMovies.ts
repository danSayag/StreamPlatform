import { useEffect, useState } from 'react'
import { apiFetch } from './api'
import type { Movie } from '../types'

export const useMovies = () => {
  const [movies, setMovies] = useState<Movie[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const controller = new AbortController()

    // Bare /movies, not /api/movies: the backend maps it there, and the Vite proxy
    // forwards the prefix unchanged.
    apiFetch('/movies', { signal: controller.signal })
      .then((response) => response.json())
      .then((data: Movie[]) => setMovies(data))
      .catch((err: Error) => {
        if (err.name !== 'AbortError') setError(err.message)
      })
      .finally(() => setLoading(false))

    return () => controller.abort()
  }, [])

  return { movies, error, loading }
}
