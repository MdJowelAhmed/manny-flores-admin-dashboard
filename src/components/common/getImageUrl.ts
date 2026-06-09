const API_BASE = (import.meta.env.VITE_API_BASE_URL || 'http://10.10.7.28:5000').replace(
    /\/$/,
    ''
  )
  
  function isPlaceholderImage(path: string): boolean {
    return path === '/image.png' || path.endsWith('/image.png')
  }
  
  /** Full absolute URL — use as fallback when relative /uploads fails */
  export function imageUrlAbsolute(imageurl?: string | null): string {
    if (!imageurl) return ''
    const trimmed = imageurl.trim()
    if (!trimmed || isPlaceholderImage(trimmed)) return ''
    if (trimmed.startsWith('http') || trimmed.startsWith('blob:')) return trimmed
    const path = trimmed.startsWith('/') ? trimmed : `/${trimmed}`
    return `${API_BASE}${path}`
  }
  
  /**
   * Prefer relative /uploads paths so Vite dev proxy can serve files without CORS.
   * Other paths are resolved against VITE_API_BASE_URL.
   */
  export function imageUrl(imageurl?: string | null): string {
    if (!imageurl) return ''
    const trimmed = imageurl.trim()
    if (!trimmed || isPlaceholderImage(trimmed)) return ''
    if (trimmed.startsWith('http') || trimmed.startsWith('blob:')) return trimmed
    if (trimmed.startsWith('/uploads')) return trimmed
    return imageUrlAbsolute(trimmed)
  }