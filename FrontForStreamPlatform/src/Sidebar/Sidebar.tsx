import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'

type NavItem = {
  to: string
  label: string
  icon: string
  adminOnly?: boolean
}

// Routes deliberately avoid /movies and /lists: those prefixes are proxied to the API in
// dev, so a hard refresh on them would return JSON instead of the app.
const NAV_ITEMS: NavItem[] = [
  {
    to: '/',
    label: 'Home',
    icon: 'M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75',
  },
  {
    to: '/browse',
    label: 'Movies',
    icon: 'M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h1.5C5.496 19.5 6 18.996 6 18.375m-3.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125M18 18.375a1.125 1.125 0 001.125 1.125M18 18.375V5.625m1.125 9.75h-1.5m1.5 0c.621 0 1.125.504 1.125 1.125M6 18.375V5.625M6 18.375h1.5m-1.5 0c0-.621-.504-1.125-1.125-1.125M6 5.625c0-.621-.504-1.125-1.125-1.125M6 5.625h1.5m9 0h1.5m0 0c0-.621.504-1.125 1.125-1.125M9 9.75h6M9 14.25h6',
  },
  {
    to: '/series',
    label: 'Series',
    icon: 'M6 20.25h12m-7.5-3v3m3-3v3m-10.125-3h17.25c.621 0 1.125-.504 1.125-1.125V4.875c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125z',
  },
  {
    to: '/my-lists',
    label: 'My Lists',
    icon: 'M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z',
    adminOnly: true,
  },
  {
    to: '/admin',
    label: 'Admin panel',
    icon: 'M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z',
    adminOnly: true,
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

export const Sidebar = () => {
  const [open, setOpen] = useState(false)
  const { session, isAdmin, signOut } = useAuth()

  // Lists are admin-only server-side; hiding the link keeps a ROLE_USER from walking
  // into a guaranteed 403.
  const items = NAV_ITEMS.filter((item) => !item.adminOnly || isAdmin)

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
      isActive ? 'bg-violet-600/20 text-violet-300' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
    }`

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
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              onClick={() => setOpen(false)}
              className={linkClass}
            >
              <Icon path={item.icon} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className='border-t border-gray-800 px-3 py-4'>
          <p className='truncate px-3 text-sm font-medium text-white'>{session?.username}</p>
          <p className='mb-3 px-3 text-xs text-gray-500'>
            {isAdmin ? 'Administrator' : 'Viewer'}
          </p>
          <button
            type='button'
            onClick={signOut}
            className='flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-400 transition hover:bg-gray-800 hover:text-white'
          >
            <Icon path='M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75' />
            Sign out
          </button>
        </div>
      </aside>
    </>
  )
}
