import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { Bookmark, Film, House, LogOut, Menu, Search, Settings, Tv, X, type LucideIcon } from 'lucide-react'
import { useAuth } from '../auth/useAuth'

type NavItem = {
  to: string
  label: string
  icon: LucideIcon
  adminOnly?: boolean
}

// Routes deliberately avoid /movies and /lists: those prefixes are proxied to the API in
// dev, so a hard refresh on them would return JSON instead of the app.
const NAV_ITEMS: NavItem[] = [
  { to: '/search', label: 'Search', icon: Search },
  { to: '/', label: 'Home', icon: House },
  { to: '/browse', label: 'Movies', icon: Film },
  { to: '/series', label: 'Series', icon: Tv },
  { to: '/my-lists', label: 'My Lists', icon: Bookmark, adminOnly: true },
  { to: '/admin', label: 'Admin panel', icon: Settings, adminOnly: true },
]

// One place to keep every icon the same size and weight.
const ICON_PROPS = { size: 20, strokeWidth: 1.5, 'aria-hidden': true } as const

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
        <Menu {...ICON_PROPS} />
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
            <X {...ICON_PROPS} />
          </button>
        </div>

        <nav className='flex flex-1 flex-col gap-1 px-3'>
          {items.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              onClick={() => setOpen(false)}
              className={linkClass}
            >
              <Icon {...ICON_PROPS} className='shrink-0' />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className='border-t border-gray-800 px-3 py-4'>
          <p className='truncate px-3 text-sm font-medium text-white'>{session?.username}</p>
          <p className='mb-3 px-3 text-xs text-gray-500'>{isAdmin ? 'Administrator' : 'Viewer'}</p>
          <button
            type='button'
            onClick={signOut}
            className='flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-400 transition hover:bg-gray-800 hover:text-white'
          >
            <LogOut {...ICON_PROPS} className='shrink-0' />
            Sign out
          </button>
        </div>
      </aside>
    </>
  )
}
