import { useEffect, useState } from 'react'
import { apiFetch } from './api'
import type { Movie } from '../types'

/**
 * GET /movies/search/category/{category} - every movie in one category.
 *
 * The value has to be the enum constant (DRAMA, SCI_FI), not the display label: Spring
 * binds @PathVariable Category by Enum.valueOf, so "Sci-Fi" would 400.
 */
export const useCategoryFilter = (category: string | null) => {
  const [results, setResults] = useState<Movie[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const term = category?.trim()

    // No chip selected ("All") means no request: the page shows the full catalog instead.
    if (!term) {
      setResults([])
      setError(null)
      setLoading(false)
      return
    }

    const controller = new AbortController()
    setLoading(true)

    // Leading slash matters: without it the browser resolves the URL against the current
    // route, so /search would ask for /movies/DRAMA relative to it and miss the proxy.
    const url = `/movies/search/category/${encodeURIComponent(term)}`

    apiFetch(url, { signal: controller.signal })
      .then((response) => response.json())
      .then((data: Movie[]) => {
        setResults(data)
        setError(null)
      })
      .catch((err: Error) => {
        if (err.name === 'AbortError') return
        setError(err.message)
        setResults([])
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })

    return () => controller.abort()
  }, [category])

  return { results, error, loading }
}
