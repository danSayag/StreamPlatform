import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import { useAuth } from '../auth/useAuth'
import { labelOf } from '../lib/categories'
import { posterSrcOf, videoSrcOf, type Movie } from '../types'

/**
 * Playback modal for a single movie.
 *
 * Rendered only while a movie is selected, so the <video> element is created on open and
 * destroyed on close - that stops the stream rather than leaving it buffering behind a
 * hidden dialog.
 */
export const MoviePlayer = ({ movie, onClose }: { movie: Movie; onClose: () => void }) => {
  const { session } = useAuth()
  const source = videoSrcOf(movie, session?.token)
  const poster = posterSrcOf(movie, session?.token)
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    // The page behind must not scroll while the dialog owns the screen.
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
    }
  }, [onClose])

  return (
    <div
      role='dialog'
      aria-modal='true'
      aria-label={movie.movieName}
      // Backdrop click closes; the guard stops a click inside the panel bubbling up here.
      onClick={onClose}
      className='fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4'
    >
      <div
        onClick={(event) => event.stopPropagation()}
        className='w-full max-w-4xl overflow-hidden rounded-xl border border-gray-800 bg-[#0f1720] shadow-2xl'
      >
        <div className='flex items-start justify-between gap-4 border-b border-gray-800 px-5 py-4'>
          <div className='min-w-0'>
            <h2 className='truncate text-lg font-bold text-white'>{movie.movieName}</h2>
            {movie.category && (
              <p className='mt-0.5 text-sm text-gray-400'>{labelOf(movie.category)}</p>
            )}
          </div>
          <button
            ref={closeRef}
            type='button'
            onClick={onClose}
            aria-label='Close player'
            className='shrink-0 rounded-lg p-1.5 text-gray-400 transition hover:bg-white/10 hover:text-white'
          >
            <X size={20} strokeWidth={1.5} aria-hidden />
          </button>
        </div>

        <div className='bg-black'>
          {source ? (
            <video
              key={source}
              src={source}
              poster={poster ?? undefined}
              controls
              autoPlay
              className='max-h-[70vh] w-full'
            >
              Your browser cannot play this file.
            </video>
          ) : (
            <div className='flex aspect-video w-full items-center justify-center px-6 text-center'>
              <div>
                <p className='text-gray-300'>No video is attached to this title yet.</p>
                <p className='mt-1 text-sm text-gray-500'>
                  Add a file path in the admin panel to make it playable.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
