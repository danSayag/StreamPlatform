import { useEffect, useState } from 'react'
import { apiFetch } from './api'
import type { Movie } from '../types'

/** How long typing has to pause before a request goes out. */
const DEBOUNCE_MS = 300

/** GET /movies/search/{query} - fuzzy title match, scored server-side. */
export const useMovieSearch = (query: string) => {
  const [results, setResults] = useState<Movie[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const term = query.trim()

    // An empty box is not a search: clear the last results instead of asking the server
    // for /movies/search/ , which would not even match the mapping.
    if (!term) {
      setResults([])
      setError(null)
      setLoading(false)
      return
    }

    const controller = new AbortController()
    setLoading(true)

    const timer = setTimeout(() => {
      // encodeURIComponent so a title with a space, ? or & stays one path segment.
      apiFetch(`/movies/search/${encodeURIComponent(term)}`, { signal: controller.signal })
        .then((response) => response.json())
        .then((data: Movie[]) => {
          setResults(data)
          setError(null)
        })
        .catch((err: Error) => {
          // An abort is this effect cleaning up after itself, not a failure.
          if (err.name === 'AbortError') return
          setError(err.message)
          setResults([])
        })
        .finally(() => {
          if (!controller.signal.aborted) setLoading(false)
        })
    }, DEBOUNCE_MS)

    // Runs before the next keystroke's effect: drops the pending timer and cancels a
    // request already in flight, so an older response can never overwrite a newer one.
    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [query])

  return { results, error, loading }
}
