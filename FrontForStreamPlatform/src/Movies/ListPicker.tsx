import { useEffect, useRef, useState } from 'react'
import { Bookmark } from 'lucide-react'
import type { Movie } from '../types'
import { useLists } from '../lib/useLists'

export const ListPicker = ({ movie }: { movie: Movie }) => {
  const { lists, createList, toggleInList } = useLists()
  const [open, setOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const [name, setName] = useState('')
  const rootRef = useRef<HTMLDivElement>(null)

  const saved = lists.some((l) => l.movies.some((m) => m.movieId === movie.movieId))

  useEffect(() => {
    if (!open) return
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  const submitNewList = () => {
    if (!name.trim()) return
    createList(name, movie)
    setName('')
    setCreating(false)
  }

  return (
    <div ref={rootRef} className='absolute top-2 right-2 z-20'>
      <button
        type='button'
        onClick={() => setOpen((v) => !v)}
        aria-label={`Add ${movie.movieName} to a list`}
        aria-expanded={open}
        className={`rounded-full bg-black/60 p-1.5 text-white transition hover:bg-black/80 ${
          saved || open ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 focus-visible:opacity-100'
        }`}
      >
        {/* Filled while the movie is in a list, outline otherwise. */}
        <Bookmark
          size={16}
          strokeWidth={1.5}
          fill={saved ? 'currentColor' : 'none'}
          className={saved ? 'text-violet-400' : undefined}
          aria-hidden='true'
        />
      </button>

      {open && (
        <div className='absolute top-9 right-0 w-52 rounded-lg border border-gray-700 bg-gray-900 p-2 shadow-xl'>
          <p className='px-2 pt-1 pb-2 text-xs font-semibold tracking-wide text-gray-500 uppercase'>
            Save to
          </p>

          <div className='max-h-48 overflow-y-auto'>
            {lists.length === 0 && !creating && (
              <p className='px-2 pb-2 text-xs text-gray-500'>No lists yet.</p>
            )}
            {lists.map((list) => {
              const checked = list.movies.some((m) => m.movieId === movie.movieId)
              return (
                <label
                  key={list.id}
                  className='flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm text-gray-200 hover:bg-gray-800'
                >
                  <input
                    type='checkbox'
                    checked={checked}
                    onChange={() => toggleInList(list.id, movie)}
                    className='h-3.5 w-3.5 accent-violet-500'
                  />
                  <span className='truncate'>{list.name}</span>
                </label>
              )
            })}
          </div>

          {creating ? (
            <div className='mt-1 flex gap-1 border-t border-gray-800 pt-2'>
              <input
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') submitNewList()
                  if (e.key === 'Escape') setCreating(false)
                }}
                placeholder='List name'
                className='min-w-0 flex-1 rounded-md bg-gray-800 px-2 py-1 text-sm text-white placeholder-gray-500 outline-none focus:ring-1 focus:ring-violet-500'
              />
              <button
                type='button'
                onClick={submitNewList}
                className='rounded-md bg-violet-600 px-2 py-1 text-xs font-semibold text-white hover:bg-violet-500'
              >
                Add
              </button>
            </div>
          ) : (
            <button
              type='button'
              onClick={() => setCreating(true)}
              className='mt-1 w-full rounded-md border-t border-gray-800 px-2 py-1.5 text-left text-sm text-violet-400 hover:text-violet-300'
            >
              + New list
            </button>
          )}
        </div>
      )}
    </div>
  )
}
