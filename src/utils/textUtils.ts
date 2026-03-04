const MAX_WORDS = 100

/**
 * Slice message to max 100 words. If longer, returns first 100 words followed by "..."
 */
export function sliceMessageByWords(text: string, maxWords = MAX_WORDS): string {
  if (!text?.trim()) return ''
  const words = text.trim().split(/\s+/)
  if (words.length <= maxWords) return text.trim()
  return words.slice(0, maxWords).join(' ') + '...'
}
