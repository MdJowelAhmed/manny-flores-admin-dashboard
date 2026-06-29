import type { CompanyProjectStatus } from '@/redux/api/companyProjectApi'

export function normalizeCompanyProjectStatus(
  value?: string | null
): CompanyProjectStatus {
  const upper = (value ?? 'PENDING').toUpperCase()
  switch (upper) {
    case 'PENDING':
    case 'IN_PROGRESS':
    case 'ACTIVE':
    case 'COMPLETED':
    case 'CANCELLED':
      return upper as CompanyProjectStatus
    default:
      return 'PENDING'
  }
}

export function formatCompanyProjectStatusLabel(status: CompanyProjectStatus): string {
  switch (status) {
    case 'PENDING':
      return 'Pending'
    case 'IN_PROGRESS':
    case 'ACTIVE':
      return 'In Progress'
    case 'COMPLETED':
      return 'Completed'
    case 'CANCELLED':
      return 'Cancelled'
    default:
      return status
  }
}

export function companyProjectStatusBadgeVariant(
  status: CompanyProjectStatus
): 'warning' | 'success' | 'info' | 'error' | 'secondary' {
  switch (status) {
    case 'PENDING':
      return 'warning'
    case 'IN_PROGRESS':
    case 'ACTIVE':
      return 'info'
    case 'COMPLETED':
      return 'success'
    case 'CANCELLED':
      return 'error'
    default:
      return 'secondary'
  }
}
