import { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAppSelector } from '@/redux/hooks'
import { UserRole } from '@/types/roles'

interface RoleBasedRouteProps {
  children: ReactNode
  allowedRoles: UserRole[]
}

export function RoleBasedRoute({ children, allowedRoles }: RoleBasedRouteProps) {
  const { user, isAuthenticated } = useAppSelector((state) => state.auth)
  const location = useLocation()

  if (!isAuthenticated || !user) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />
  }

  if (!allowedRoles.includes(user.role as UserRole)) {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}

interface RouteGuardProps {
  children: ReactNode
}

/** Legacy: allows super-admin only. Prefer RoleBasedRoute with allowedRoles. */
export function RouteGuard({ children }: RouteGuardProps) {
  const { user, isAuthenticated } = useAppSelector((state) => state.auth)
  const location = useLocation()

  if (!isAuthenticated || !user || user.role !== UserRole.SUPER_ADMIN) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />
  }

  return <>{children}</>
}
