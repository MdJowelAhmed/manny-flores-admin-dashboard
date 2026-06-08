import type { CompanyProjectTaskPriority } from '@/redux/api/companyProjectApi'

export const projectCardActionClass = {
  viewTask:
    'bg-sky-50 text-sky-600 border-sky-100 hover:bg-sky-100 hover:text-sky-700',
  assignEmployee:
    'bg-orange-50 text-orange-600 border-orange-100 hover:bg-orange-100 hover:text-orange-700',
  projectDetails:
    'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:text-gray-700',
  edit: 'bg-rose-50 text-rose-600 border-rose-100 hover:bg-rose-100 hover:text-rose-700',
} as const

export function getTaskPriorityClass(priority?: string): string {
  switch ((priority ?? '').toUpperCase()) {
    case 'HIGH':
      return 'text-emerald-600 font-semibold'
    case 'MEDIUM':
      return 'text-amber-600 font-semibold'
    case 'LOW':
      return 'text-gray-500 font-medium'
    default:
      return 'text-gray-600'
  }
}

export function formatTaskDeadline(iso?: string): string {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function isTaskPriority(
  value: string
): value is CompanyProjectTaskPriority {
  return ['LOW', 'MEDIUM', 'HIGH'].includes(value.toUpperCase())
}
