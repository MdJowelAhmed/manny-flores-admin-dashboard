import { API_BASE_URL } from '@/config/api'

function isPlaceholderImage(path: string): boolean {
  return path === '/image.png' || path.endsWith('/image.png')
}

/** Full absolute URL — only for opening files in new tab / last-resort fallback */
export function imageUrlAbsolute(imageurl?: string | null): string {
  if (!imageurl) return ''
  const trimmed = imageurl.trim()
  if (!trimmed || isPlaceholderImage(trimmed)) return ''
  if (trimmed.startsWith('http') || trimmed.startsWith('blob:') || trimmed.startsWith('data:')) {
    return trimmed
  }
  const path = trimmed.startsWith('/') ? trimmed : `/${trimmed}`
  return `${API_BASE_URL}${path}`
}

/**
 * Prefer relative `/uploads` (and `/image/...`) paths so the browser loads images
 * from the SAME origin as the app (Vite dev/preview proxy or nginx on live).
 *
 * Loading `http://api-host:5000/uploads/...` directly from an app on another port
 * is blocked by the API's `Cross-Origin-Resource-Policy: same-origin` header.
 */
export function imageUrl(imageurl?: string | null): string {
  if (!imageurl) return ''
  const trimmed = imageurl.trim()
  if (!trimmed || isPlaceholderImage(trimmed)) return ''
  if (trimmed.startsWith('http') || trimmed.startsWith('blob:') || trimmed.startsWith('data:')) {
    return trimmed
  }

  const path = trimmed.startsWith('/') ? trimmed : `/${trimmed}`

  if (path.startsWith('/uploads') || path.startsWith('/image/')) {
    return path
  }

  return imageUrlAbsolute(path)
}
