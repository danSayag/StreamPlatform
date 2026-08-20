import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from './useAuth'

/**
 * Sits inside ProtectedRoute: the session already exists here, this only checks the role.
 * A signed-in ROLE_USER goes home rather than to /signin - they are authenticated, so
 * bouncing them to the sign-in form would be a loop.
 */
export const AdminRoute = () => {
  const { isAdmin } = useAuth()
  return isAdmin ? <Outlet /> : <Navigate to='/' replace />
}
