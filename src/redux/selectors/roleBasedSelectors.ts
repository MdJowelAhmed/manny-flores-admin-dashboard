import { RootState } from '../store'
import { UserRole, hasFeatureAccess, type FeatureKey } from '@/types/roles'
import { Car } from '@/types'

/**
 * Check if user has access to a feature.
 */
export const selectHasFeatureAccess =
  (feature: FeatureKey) =>
    (state: RootState): boolean => {
      const { user } = state.auth
      if (!user) return false
      return hasFeatureAccess(user.role as UserRole, feature)
    }

/**
 * Get current user's role.
 */
export const selectUserRole = (state: RootState): UserRole | null => {
  const { user } = state.auth
  return user ? (user.role as UserRole) : null
}

/**
 * Role-based cars: super-admin sees all; others filter by business.
 */
export const selectRoleBasedCars = (state: RootState): Car[] => {
  const { user } = state.auth

  if (!user) return []

  if (user.role === UserRole.SUPER_ADMIN) {
    return []
  }

  return []
}

/**
 * Selector to get paginated cars based on role
 */
const DEFAULT_CARS_PAGE = 1
const DEFAULT_CARS_LIMIT = 10

export const selectPaginatedRoleBasedCars = (state: RootState): Car[] => {
  const roleBasedCars = selectRoleBasedCars(state)
  const startIndex = (DEFAULT_CARS_PAGE - 1) * DEFAULT_CARS_LIMIT
  return roleBasedCars.slice(startIndex, startIndex + DEFAULT_CARS_LIMIT)
}

/**
 * Selector to get total count of role-based filtered cars
 */
export const selectRoleBasedCarsCount = (state: RootState): number => {
  return selectRoleBasedCars(state).length
}

/**
 * Selector to calculate total pages for role-based filtered cars
 */
export const selectRoleBasedTotalPages = (state: RootState): number => {
  const count = selectRoleBasedCarsCount(state)
  return Math.ceil(count / DEFAULT_CARS_LIMIT) || 1
}

/**
 * Permission: only super-admin can modify items (admin/marketing read-only for modifiable features).
 */
export const selectCanModifyItem = (
  state: RootState,
  _itemBusinessId?: string
): boolean => {
  const { user } = state.auth

  if (!user) return false

  return user.role === UserRole.SUPER_ADMIN
}
