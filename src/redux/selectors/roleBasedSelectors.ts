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
  const { filteredList } = state.cars

  if (!user) return []

  if (user.role === UserRole.SUPER_ADMIN) {
    return filteredList
  }

  return []
}

/**
 * Selector to get paginated cars based on role
 */
export const selectPaginatedRoleBasedCars = (state: RootState): Car[] => {
  const roleBasedCars = selectRoleBasedCars(state)
  const { pagination } = state.cars

  const startIndex = (pagination.page - 1) * pagination.limit
  return roleBasedCars.slice(startIndex, startIndex + pagination.limit)
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
  const { limit } = state.cars.pagination
  return Math.ceil(count / limit)
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
