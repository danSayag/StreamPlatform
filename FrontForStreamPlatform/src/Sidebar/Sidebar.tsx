import { useState } from 'react'

export type NavKey = 'home' | 'movies' | 'series' | 'myList'

type NavItem = {
  key: NavKey
  label: string
  icon: string
}

// Heroicons-style outline paths, 24x24 viewBox.
const NAV_ITEMS: NavItem[] = [
  {
    key: 'home',
    label: 'Home',
    icon: 'M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75',
  },
  {
    key: 'movies',
    label: 'Movies',
    icon: 'M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h1.5C5.496 19.5 6 18.996 6 18.375m-3.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125M18 18.375a1.125 1.125 0 001.125 1.125M18 18.375V5.625m1.125 9.75h-1.5m1.5 0c.621 0 1.125.504 1.125 1.125M6 18.375V5.625M6 18.375h1.5m-1.5 0c0-.621-.504-1.125-1.125-1.125M6 5.625c0-.621-.504-1.125-1.125-1.125M6 5.625h1.5m9 0h1.5m0 0c0-.621.504-1.125 1.125-1.125M9 9.75h6M9 14.25h6',
  },
  {
    key: 'series',
    label: 'Series',
    icon: 'M6 20.25h12m-7.5-3v3m3-3v3m-10.125-3h17.25c.621 0 1.125-.504 1.125-1.125V4.875c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125z',
  },
  {
    key: 'myList',
    label: 'My Lists',
    icon: 'M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z',
  },
]

const Icon = ({ path }: { path: string }) => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    fill='none'
    viewBox='0 0 24 24'
    strokeWidth={1.5}
    stroke='currentColor'
    className='h-5 w-5 shrink-0'
    aria-hidden='true'
  >
    <path strokeLinecap='round' strokeLinejoin='round' d={path} />
  </svg>
)

type SidebarProps = {
  active: NavKey
  onSelect: (key: NavKey) => void
}

export const Sidebar = ({ active, onSelect }: SidebarProps) => {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Mobile toggle */}
      <button
        type='button'
        onClick={() => setOpen(true)}
        aria-label='Open navigation'
        className='fixed top-4 left-4 z-30 rounded-md bg-gray-800 p-2 text-gray-200 md:hidden'
      >
        <Icon path='M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5' />
      </button>

      {/* Backdrop, mobile only */}
      {open && (
        <div
          className='fixed inset-0 z-30 bg-black/60 md:hidden'
          onClick={() => setOpen(false)}
          aria-hidden='true'
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-60 flex-col border-r border-gray-800 bg-[#0f1720] transition-transform duration-200 md:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className='flex items-center justify-between px-6 py-6'>
          <span className='text-xl font-bold tracking-tight text-violet-400'>StreamPlatform</span>
          <button
            type='button'
            onClick={() => setOpen(false)}
            aria-label='Close navigation'
            className='text-gray-400 hover:text-white md:hidden'
          >
            <Icon path='M6 18L18 6M6 6l12 12' />
          </button>
        </div>

        <nav className='flex flex-1 flex-col gap-1 px-3'>
          {NAV_ITEMS.map((item) => {
            const isActive = item.key === active
            return (
              <button
                key={item.key}
                type='button'
                onClick={() => {
                  onSelect(item.key)
                  setOpen(false)
                }}
                aria-current={isActive ? 'page' : undefined}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? 'bg-violet-600/20 text-violet-300'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <Icon path={item.icon} />
                {item.label}
              </button>
            )
          })}
        </nav>

        <div className='border-t border-gray-800 px-6 py-4 text-xs text-gray-500'>
          Java + React
        </div>
      </aside>
    </>
  )
}
