import type { ProjectStatus, RecentProject } from './recentProjectsData'

/** Matches design: green / yellow / purple / red */
export function getProjectStatusBadgeClass(
  status: RecentProject['status']
): string {
  switch (status) {
    case 'Completed':
      return 'bg-emerald-100 text-emerald-800'
    case 'In Progress':
      return 'bg-amber-100 text-amber-800'
    case 'Scheduled':
      return 'bg-purple-100 text-purple-800'
    case 'Overdue':
      return 'bg-red-100 text-red-800'
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
  }
}
