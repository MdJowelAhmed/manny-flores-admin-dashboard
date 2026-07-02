import type { BaseQueryApi } from '@reduxjs/toolkit/query'
import { logout } from './slices/authSlice'
import { toast } from '@/utils/toast'

const AUTH_PUBLIC_PATHS = [
  '/auth/login',
  '/auth/register',
  '/auth/forget-password',
  '/auth/resend-otp',
  '/auth/verify-email',
  '/auth/reset-password',
]

let isHandlingSessionExpiry = false

export function isAuthPublicEndpoint(url: string): boolean {
  return AUTH_PUBLIC_PATHS.some((path) => url.includes(path))
}

export function getStoredToken(): string | null {
  if (typeof localStorage === 'undefined') return null
  return localStorage.getItem('token')
}

export function handleSessionExpired(
  api: Pick<BaseQueryApi, 'dispatch'>,
  resetApiState: () => void
): void {
  if (isHandlingSessionExpiry) return
  isHandlingSessionExpiry = true

  api.dispatch(logout())
  resetApiState()

  toast({
    title: 'Session expired',
    description: 'Please sign in again to continue.',
    variant: 'destructive',
  })

  if (!window.location.pathname.startsWith('/auth/')) {
    window.location.replace('/auth/login')
  }
}
