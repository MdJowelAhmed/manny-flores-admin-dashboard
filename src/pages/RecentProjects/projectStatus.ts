import type { CSSProperties } from 'react'
import type { ProjectStatus, RecentProject } from './recentProjectsData'

/** Brand hex per status */
export const PROJECT_STATUS_HEX: Record<RecentProject['status'], string> = {
  Completed: '#00A63E',
  'In Progress': '#FFCC00',
  Scheduled: '#3B82F6',
  Overdue: '#FF383C',
  'Pending Approval': '#F59E0B',
}

/**
 * Pill badge using hex colors: light tint background + readable foreground.
 * Yellow uses dark text for contrast; others use the brand hex on tint.
 */
export function getProjectStatusBadgeStyle(
  status: RecentProject['status']
): CSSProperties {
  const hex = PROJECT_STATUS_HEX[status] || '#6B7280'
  const backgroundColor = `${hex}26`

  const color =
    status === 'In Progress' || status === 'Pending Approval'
      ? '#3D3300' /* readable on light yellow/amber */
      : hex

  return {
    backgroundColor,
    color,
  }
}

/** i18n keys under `recentProjectsPage` */
export function getProjectStatusTranslationKey(
  status: ProjectStatus
): `recentProjectsPage.${string}` {
  switch (status) {
    case 'Completed':
      return 'recentProjectsPage.completed'
    case 'In Progress':
      return 'recentProjectsPage.inProgress'
    case 'Scheduled':
      return 'recentProjectsPage.scheduled'
    case 'Overdue':
      return 'recentProjectsPage.overdue'
    case 'Pending Approval':
      return 'recentProjectsPage.pendingApproval'
    default:
      return 'recentProjectsPage.scheduled'
  }
}
