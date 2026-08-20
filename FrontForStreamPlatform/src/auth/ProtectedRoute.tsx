import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from './useAuth'

/**
 * Gate for every signed-in screen. Remembers where the user was headed so signing in
 * returns them there instead of dumping them on the home page.
 */
export const ProtectedRoute = () => {
  const { isAuthenticated } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to='/signin' replace state={{ from: location }} />
  }
  return <Outlet />
}
