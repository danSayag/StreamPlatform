import { useCallback, useEffect, useState } from 'react'
import { apiFetch } from './api'
import type { Movie } from '../types'

export type CategoryOption = { value: string; label: string }

export type MovieDraft = {
  movieName: string
  category: string
  posterUrl: string
  videoPath: string
}

/**
 * Admin-side movie CRUD. Kept separate from useMovies, which is the read-only hook the
 * catalog screens share - only the admin panel needs writes or a manual refresh.
 */
export const useMovieAdmin = () => {
  const [movies, setMovies] = useState<Movie[]>([])
  const [options, setOptions] = useState<CategoryOption[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    const response = await apiFetch('/movies')
    setMovies((await response.json()) as Movie[])
  }, [])

  useEffect(() => {
    Promise.all([
      refresh(),
      apiFetch('/movies/category-options')
        .then((response) => response.json())
        .then((data: CategoryOption[]) => setOptions(data)),
    ])
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false))
  }, [refresh])

  // Both writes refetch rather than patching local state: the server assigns the id and
  // owns the ordering, so re-reading is cheaper to keep correct.
  const save = useCallback(
    async (draft: MovieDraft, movieId?: number) => {
      setError(null)
      try {
        await apiFetch(movieId === undefined ? '/movies' : `/movies/${movieId}`, {
          method: movieId === undefined ? 'POST' : 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(draft),
        })
        await refresh()
        return true
      } catch (err) {
        setError((err as Error).message)
        return false
      }
    },
    [refresh],
  )

  return { movies, options, loading, error, save, setError }
}
