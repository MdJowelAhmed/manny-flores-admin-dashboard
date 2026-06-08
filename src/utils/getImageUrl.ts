export function getImageUrl(imageurl: string) {
  if (!imageurl?.trim()) return ''

  if (
    imageurl.startsWith('http') ||
    imageurl.startsWith('blob:') ||
    imageurl.startsWith('data:')
  ) {
    return imageurl
  }

  const path = imageurl.startsWith('/') ? imageurl : `/${imageurl}`

  // Dev: serve uploads through Vite proxy (avoids CORS / cross-origin image blocks)
  if (import.meta.env.DEV) {
    return path
  }

  const base = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '')
  return base ? `${base}${path}` : path
}
