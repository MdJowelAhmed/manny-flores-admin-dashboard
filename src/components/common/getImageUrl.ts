const API_BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '')

export const imageUrl = (path?: string): string => {
  if (!path) return ''

  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path
  }

  const normalized = path.startsWith('/') ? path : `/${path}`

  return `${API_BASE}${normalized}`
}