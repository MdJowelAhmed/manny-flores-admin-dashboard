import type { ProjectPlanFile } from './recentProjectsData'

export function downloadProjectPlanFile(plan: ProjectPlanFile): void {
  if (plan.blobUrl) {
    const a = document.createElement('a')
    a.href = plan.blobUrl
    a.download = plan.name
    a.rel = 'noopener'
    a.click()
    return
  }
  const blob = new Blob([], { type: 'application/octet-stream' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = plan.name
  a.rel = 'noopener'
  a.click()
  URL.revokeObjectURL(url)
}
