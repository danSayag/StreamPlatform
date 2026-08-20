import { useState } from 'react'
import { Link } from 'react-router-dom'
import { MovieGrid } from '../Movies/Movies'
import { useLists, type MovieList } from '../lib/useLists'

const ListSection = ({
  list,
  onRename,
  onDelete,
}: {
  list: MovieList
  onRename: (id: number, name: string) => void
  onDelete: (id: number) => void
}) => {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(list.name)

  const commit = () => {
    onRename(list.id, draft)
    setEditing(false)
  }

  return (
    <section className='mb-12'>
      <div className='mb-4 flex items-center gap-3'>
        {editing ? (
          <input
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commit()
              if (e.key === 'Escape') {
                setDraft(list.name)
                setEditing(false)
              }
            }}
            className='rounded-md bg-gray-800 px-2 py-1 text-xl font-bold text-white outline-none focus:ring-1 focus:ring-violet-500'
          />
        ) : (
          <h2 className='text-xl font-bold text-white'>{list.name}</h2>
        )}
        <span className='text-sm text-gray-500'>
          {list.movies.length} {list.movies.length === 1 ? 'title' : 'titles'}
        </span>
        <div className='ml-auto flex gap-3 text-sm'>
          <button
            type='button'
            onClick={() => {
              setDraft(list.name)
              setEditing(true)
            }}
            className='text-gray-400 transition hover:text-white'
          >
            Rename
          </button>
          <button
            type='button'
            onClick={() => onDelete(list.id)}
            className='text-gray-400 transition hover:text-red-400'
          >
            Delete
          </button>
        </div>
      </div>

      {list.movies.length === 0 ? (
        <p className='rounded-lg border border-dashed border-gray-700 px-6 py-10 text-center text-sm text-gray-500'>
          This list is empty. Use the bookmark button on any movie to add titles.
        </p>
      ) : (
        <MovieGrid movies={list.movies} />
      )}
    </section>
  )
}

export const MyList = () => {
  const { lists, loading, error, createList, renameList, deleteList } = useLists()
  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)

  const submit = async (event: { preventDefault: () => void }) => {
    event.preventDefault()
    if (!name.trim() || saving) return
    setSaving(true)
    const created = await createList(name)
    setSaving(false)
    if (created !== null) setName('')
  }

  return (
    <div className='mx-auto max-w-6xl px-6 py-10'>
      <div className='mb-8 flex flex-wrap items-center justify-between gap-4'>
        <h1 className='text-2xl font-bold text-white'>My Lists</h1>
        <form onSubmit={submit} className='flex gap-2'>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder='New list name'
            className='rounded-lg bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-500 outline-none focus:ring-1 focus:ring-violet-500'
          />
          <button
            type='submit'
            disabled={saving || !name.trim()}
            className='rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-50'
          >
            {saving ? 'Creating…' : 'Create list'}
          </button>
        </form>
      </div>

      {error && (
        <p className='mb-6 rounded-lg border border-red-900 bg-red-950/40 px-4 py-3 text-sm text-red-300'>
          {error}
        </p>
      )}

      {loading ? (
        <p className='text-sm text-gray-500'>Loading your lists…</p>
      ) : lists.length === 0 ? (
        <div className='rounded-lg border border-dashed border-gray-700 px-6 py-16 text-center'>
          <p className='text-gray-400'>You have no lists yet.</p>
          <p className='mt-1 text-sm text-gray-500'>
            Create one above, or save a movie straight into a new list from the catalog.
          </p>
          <Link
            to='/browse'
            className='mt-4 inline-block rounded-lg bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-500'
          >
            Browse movies
          </Link>
        </div>
      ) : (
        lists.map((list) => (
          <ListSection
            key={list.id}
            list={list}
            onRename={renameList}
            onDelete={deleteList}
          />
        ))
      )}
    </div>
  )
}
