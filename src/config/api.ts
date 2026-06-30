function requireApiBaseUrl(): string {
  const value = import.meta.env.VITE_API_BASE_URL
  if (!value || value === 'undefined') {
    throw new Error(
      'VITE_API_BASE_URL is not set. Add it to .env.local (e.g. VITE_API_BASE_URL=http://your-api-host:5000)',
    )
  }
  return value.replace(/\/$/, '')
}

/** Single source of truth — value comes from `.env.local` at build/dev time. */
export const API_BASE_URL = requireApiBaseUrl()
export const API_V1_URL = `${API_BASE_URL}/api/v1`
