import { FileText, Info, DollarSign } from 'lucide-react'

export type ChangeOrderStatus = 'Pending' | 'Approved'

export interface ChangeOrder {
  id: string
  projectId?: string | null
  estimateScheduleId?: string
  userId: string
  reasonForChange: string
  description: string
  originalCost: number
  additionalCost: number
  totalCost: number
  status?: string
  documentation: string[]
  createdAt: string
  updatedAt: string
  estimateSchedule?: {
    id: string
    estimateId: string
    projectStatus?: string
    estimate?: {
      id: string
      projectName?: string
      customerAddress?: string
      customerEmail?: string
      clientName?: string
      phone?: string
      email?: string
      company?: string
      siteAddress?: string
    }
  }
  user?: {
    id: string
    name?: string
    email?: string
    profile?: string
  }
  project?: {
    id: string
    estimateId: string
    invoiceWithSignaturesId?: string
    status: string
    clientId: string
    createdAt: string
    updatedAt: string
    estimate?: {
      projectName?: string
      clientName?: string
      phone?: string
      email?: string
      company?: string
      siteAddress?: string
      customerAddress?: string
      customerEmail?: string
    }
    estimates?: {
      projectName?: string
      clientName?: string
      phone?: string
      email?: string
      company?: string
      siteAddress?: string
      customerAddress?: string
      customerEmail?: string
    }
  }
  // Legacy / derived properties for backward compatibility during transition
  orderId?: string
  customerName?: string
  serviceType?: string
  projectName?: string
  siteAddress?: string
  company?: string
  contactNumber?: string
  newTotal?: number
  requestDate?: string
  projectStartDate?: string
  amountSpent?: number
  totalBudget?: number
  duration?: string
  remaining?: number
  email?: string
  attachments?: { name: string }[]
}

export const changeOrderStats = [
  {
    titleKey: 'changeOrders.totalChangeOrders' as const,
    value: 8,
    icon: FileText,
    iconBg: 'bg-purple-100',
    iconColor: 'text-purple-600',
  },
  {
    titleKey: 'changeOrders.awaitingResponse' as const,
    value: 2,
    icon: Info,
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
  },
  {
    titleKey: 'changeOrders.totalAdditionalRevenue' as const,
    value: 34500,
    icon: DollarSign,
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
  },
]

export const statusFilterOptions = [
  { value: 'all', labelKey: 'common.all' as const },
  { value: 'Pending', labelKey: 'dashboard.pending' as const },
  { value: 'Approved', labelKey: 'documentsApprovals.approved' as const },
]

export const statusUpdateOptions: { value: ChangeOrderStatus; label: string }[] = [
  { value: 'Pending', label: 'Pending' },
  { value: 'Approved', label: 'Approved' },
]

export const newOrderProjectOptions = [
  { value: 'Residential Backyard Renovation', labelKey: 'changeOrders.sampleProject1' as const },
  { value: 'Office Park Landscaping', labelKey: 'changeOrders.sampleProject2' as const },
  { value: 'Kitchen Remodel – Downtown', labelKey: 'changeOrders.sampleProject3' as const },
]

export const changeReasonOptions = [
  { value: 'scope_expansion', labelKey: 'changeOrders.reasonScopeExpansion' as const },
  { value: 'material_upgrade', labelKey: 'changeOrders.reasonMaterialUpgrade' as const },
  { value: 'site_condition', labelKey: 'changeOrders.reasonSiteCondition' as const },
  { value: 'client_request', labelKey: 'changeOrders.reasonClientRequest' as const },
]

export function getChangeOrderEstimate(order: ChangeOrder) {
  return (
    order.estimateSchedule?.estimate ??
    order.project?.estimates ??
    order.project?.estimate ??
    null
  )
}

export function getChangeOrderProjectName(order: ChangeOrder): string {
  return getChangeOrderEstimate(order)?.projectName ?? order.projectName ?? '—'
}

export function getChangeOrderStatus(order: ChangeOrder): string {
  const raw = order.status ?? order.project?.status
  if (!raw) return 'Pending'
  const s = raw.toUpperCase()
  if (s === 'PENDING') return 'Pending'
  if (s === 'APPROVED') return 'Approved'
  return raw
}

export function getChangeOrderSiteAddress(order: ChangeOrder): string {
  const estimate = getChangeOrderEstimate(order)
  return estimate?.siteAddress ?? estimate?.customerAddress ?? '—'
}

export function getChangeOrderCustomerName(order: ChangeOrder): string {
  return getChangeOrderEstimate(order)?.clientName ?? '—'
}

export function getChangeOrderCustomerEmail(order: ChangeOrder): string {
  const estimate = getChangeOrderEstimate(order)
  return estimate?.email ?? estimate?.customerEmail ?? '—'
}

export function getChangeOrderCustomerPhone(order: ChangeOrder): string {
  return getChangeOrderEstimate(order)?.phone ?? '—'
}

export function getChangeOrderCompany(order: ChangeOrder): string {
  return getChangeOrderEstimate(order)?.company ?? '—'
}

