/** Table dates like `12.08.26` (DD.MM.YY) → e.g. `12 August 2026` */
export function formatProjectDetailDate(ddmmyy: string): string {
  const parts = ddmmyy.split('.')
  if (parts.length !== 3) return ddmmyy
  const [d, m, y] = parts
  const year = 2000 + parseInt(y, 10)
  const date = new Date(year, parseInt(m, 10) - 1, parseInt(d, 10))
  if (Number.isNaN(date.getTime())) return ddmmyy
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}
