import { Navigate, useLocation } from 'react-router-dom'
import { useAppSelector } from '@/redux/hooks'
import { UserRole } from '@/types/roles'

const VALID_ROLES = [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MARKETING]

interface ProtectedRouteProps {
  children: React.ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth)
  const location = useLocation()

  if (!isAuthenticated || !user) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />
  }

  if (!VALID_ROLES.includes(user.role as UserRole)) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />
  }

  return <>{children}</>
}
