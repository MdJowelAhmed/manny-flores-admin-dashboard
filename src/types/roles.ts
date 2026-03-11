// Role definitions: super-admin (full access), admin, marketing
export enum UserRole {
  SUPER_ADMIN = 'super-admin',
  ADMIN = 'admin',
  MARKETING = 'marketing',
}

export type UserRoleType = (typeof UserRole)[keyof typeof UserRole]

export interface RoutePermission {
  path: string
  allowedRoles: UserRole[]
  description?: string
}

/**
 * Feature-based access matrix:
 * - super-admin: all access
 * - admin: Orders, ShopManagement (without Shop), Subscribers, Revenue, Push-notification, Profile
 * - marketing: Ad Management, Subscribers, Push-notification
 */
export const FEATURE_ACCESS: Record<string, UserRole[]> = {
  dashboard: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MARKETING],
  orders: [UserRole.SUPER_ADMIN, UserRole.ADMIN],
  'shop-management': [UserRole.SUPER_ADMIN, UserRole.ADMIN],
  'shop-management-shop': [UserRole.SUPER_ADMIN], // admin does NOT get Shop
  revenue: [UserRole.SUPER_ADMIN, UserRole.ADMIN],
  'user-management': [UserRole.SUPER_ADMIN],
  subscribers: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MARKETING],
  'ad-management': [UserRole.SUPER_ADMIN, UserRole.MARKETING],
  'push-notification': [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MARKETING],
  controllers: [UserRole.SUPER_ADMIN],
  profile: [UserRole.SUPER_ADMIN, UserRole.ADMIN],
  'company-projects': [UserRole.SUPER_ADMIN, UserRole.ADMIN],
  'customer-management': [UserRole.SUPER_ADMIN, UserRole.ADMIN],
  'employee-management': [UserRole.SUPER_ADMIN, UserRole.ADMIN],
  'vehicle-maintenance': [UserRole.SUPER_ADMIN, UserRole.ADMIN],
  'equipment-maintenance': [UserRole.SUPER_ADMIN, UserRole.ADMIN],
  reviews: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MARKETING],
  communication: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MARKETING],
  'documents-approvals': [UserRole.SUPER_ADMIN, UserRole.ADMIN],
  'project-scheduling': [UserRole.SUPER_ADMIN, UserRole.ADMIN],
  'manage-materials': [UserRole.SUPER_ADMIN, UserRole.ADMIN],
  'customer-finance': [UserRole.SUPER_ADMIN, UserRole.ADMIN],
  attendance: [UserRole.SUPER_ADMIN, UserRole.ADMIN],
}

export type FeatureKey = keyof typeof FEATURE_ACCESS

export const hasFeatureAccess = (userRole: UserRole, feature: FeatureKey): boolean => {
  const roles = FEATURE_ACCESS[feature]
  return roles ? roles.includes(userRole) : false
}
