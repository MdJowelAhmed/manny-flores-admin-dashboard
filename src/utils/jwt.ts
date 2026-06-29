import { UserRole, type UserRoleType } from '@/types/roles'

type UserRoleValue = UserRoleType

export interface JwtPayload {
  id?: string
  sub?: string
  email?: string
  role?: string
  exp?: number
  iat?: number
}

export interface AuthUserFromToken {
  id: string
  email: string
  firstName: string
  lastName: string
  role: UserRoleValue
  avatar?: string
  businessId?: string
}

function mapApiRoleToUserRole(apiRole?: string): UserRoleValue {
  const normalized = (apiRole ?? '').toUpperCase().replace(/-/g, '_')
  switch (normalized) {
    case 'SUPER_ADMIN':
      return UserRole.SUPER_ADMIN
    case 'ADMIN':
      return UserRole.ADMIN
    case 'MARKETING':
      return UserRole.MARKETING
    case 'BUILDER':
      return UserRole.BUILDER
    default:
      return UserRole.SUPER_ADMIN
  }
}

export function decodeJwtPayload(token: string): JwtPayload | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null

    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    const json = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => `%${`00${c.charCodeAt(0).toString(16)}`.slice(-2)}`)
        .join('')
    )
    return JSON.parse(json) as JwtPayload
  } catch {
    return null
  }
}

export function isTokenExpired(payload: JwtPayload): boolean {
  if (!payload.exp) return false
  return payload.exp * 1000 <= Date.now()
}

export function userFromToken(
  token: string,
  fallbackEmail = ''
): AuthUserFromToken | null {
  const payload = decodeJwtPayload(token)
  if (!payload || isTokenExpired(payload)) return null

  const id = payload.id ?? payload.sub ?? ''
  if (!id) return null

  const role = mapApiRoleToUserRole(payload.role)
  if (!Object.values(UserRole).includes(role)) return null

  return {
    id,
    email: payload.email ?? fallbackEmail,
    firstName: '',
    lastName: '',
    role,
  }
}
