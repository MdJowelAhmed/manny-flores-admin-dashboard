/** Table dates like `12.08.26` (DD.MM.YY) or ISO strings → e.g. `12 August 2026` */
export function formatProjectDetailDate(date?: string | null): string {
  if (!date?.trim()) return '—'

  const trimmed = date.trim()

  if (trimmed.includes('.')) {
    const parts = trimmed.split('.')
    if (parts.length === 3) {
      const [d, m, y] = parts
      const year = y.length === 2 ? 2000 + parseInt(y, 10) : parseInt(y, 10)
      const parsed = new Date(year, parseInt(m, 10) - 1, parseInt(d, 10))
      if (!Number.isNaN(parsed.getTime())) {
        return parsed.toLocaleDateString('en-GB', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })
      }
    }
  }

  const parsed = new Date(trimmed)
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  return trimmed
}
