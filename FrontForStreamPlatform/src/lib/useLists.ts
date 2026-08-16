import { useCallback, useEffect, useState } from 'react'
import type { Movie } from '../types'

export type MovieList = {
  id: number
  name: string
  description?: string
  movies: Movie[]
}

const BASE = '/api/lists'
// Lets every mounted useLists re-read the cache after any write, same tab.
const CHANGE_EVENT = 'lists:change'

// Module-level so all hook instances share one copy of the server state
// instead of each fetching and drifting apart.
let cache: MovieList[] = []
let loaded = false

const request = async (url: string, init?: RequestInit) => {
  const response = await fetch(url, init)
  if (!response.ok) {
    throw new Error((await response.text()) || `Request failed: ${response.status}`)
  }
  return response
}

const refresh = async () => {
  const response = await request(BASE)
  cache = (await response.json()) as MovieList[]
  loaded = true
  window.dispatchEvent(new Event(CHANGE_EVENT))
}

export const useLists = () => {
  const [lists, setLists] = useState<MovieList[]>(cache)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(!loaded)

  useEffect(() => {
    const sync = () => setLists(cache)
    window.addEventListener(CHANGE_EVENT, sync)
    refresh()
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false))
    return () => window.removeEventListener(CHANGE_EVENT, sync)
  }, [])

  // Every mutation refetches: the server owns the state, so re-reading it is
  // simpler than patching the cache and cheaper to keep correct.
  const run = useCallback(async <T,>(fn: () => Promise<T>) => {
    setError(null)
    try {
      const result = await fn()
      await refresh()
      return result
    } catch (err) {
      setError((err as Error).message)
      return null
    }
  }, [])

  const createList = useCallback(
    (name: string, firstMovie?: Movie) => {
      const trimmed = name.trim()
      if (!trimmed) return Promise.resolve(null)

      return run(async () => {
        const response = await request(BASE, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: trimmed, description: '' }),
        })
        const created = (await response.json()) as MovieList
        if (firstMovie) {
          await request(`${BASE}/${created.id}/movies/${firstMovie.Id}`, { method: 'POST' })
        }
        return created.id
      })
    },
    [run],
  )

  const renameList = useCallback(
    (id: number, name: string) => {
      const trimmed = name.trim()
      if (!trimmed) return Promise.resolve(null)
      return run(() =>
        request(`${BASE}/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: trimmed }),
        }),
      )
    },
    [run],
  )

  const deleteList = useCallback(
    (id: number) => run(() => request(`${BASE}/${id}`, { method: 'DELETE' })),
    [run],
  )

  const addToList = useCallback(
    (listId: number, movieId: number) =>
      run(() => request(`${BASE}/${listId}/movies/${movieId}`, { method: 'POST' })),
    [run],
  )

  const removeFromList = useCallback(
    (listId: number, movieId: number) =>
      run(() => request(`${BASE}/${listId}/movies/${movieId}`, { method: 'DELETE' })),
    [run],
  )

  const toggleInList = useCallback(
    (listId: number, movie: Movie) => {
      const list = cache.find((l) => l.id === listId)
      const has = list?.movies.some((m) => m.Id === movie.Id)
      return has ? removeFromList(listId, movie.Id) : addToList(listId, movie.Id)
    },
    [addToList, removeFromList],
  )

  const listsWith = useCallback(
    (movieId: number) => lists.filter((l) => l.movies.some((m) => m.Id === movieId)),
    [lists],
  )

  return {
    lists,
    loading,
    error,
    createList,
    renameList,
    deleteList,
    addToList,
    removeFromList,
    toggleInList,
    listsWith,
  }
}
