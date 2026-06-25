import { FileText, Info, DollarSign } from 'lucide-react'

export type ChangeOrderStatus = 'Pending' | 'Approved'
export type ChangeOrderProjectType = 'customer' | 'company'

export interface ChangeOrderEstimate {
  id?: string
  projectName?: string
  customerAddress?: string
  customerEmail?: string
  clientName?: string
  phone?: string
  email?: string
  company?: string
  siteAddress?: string
}

export interface ChangeOrderEstimateSchedule {
  id?: string
  estimateId?: string
  signature?: string
  projectStatus?: string
  assignEmployee?: string[]
  teamId?: string
  projectStartDate?: string
  projectEndDate?: string
  estimate?: ChangeOrderEstimate | null
}

export interface ChangeOrderCompanyProject {
  id: string
  projectName?: string
  builderId?: string
  customerEmail?: string
  paymentMethod?: string
  companyName?: string
  paymentType?: string
  amountDue?: number
  startDate?: string
  endDate?: string
  totalBudget?: number
  payAmount?: number
  documentation?: string[]
  description?: string
  teamIds?: string[]
  projectStatus?: string
  signatures?: string | null
  createdBy?: string
  createdAt?: string
  updatedAt?: string
  builder?: {
    id?: string
    name?: string
    email?: string
  } | null
}

export interface ChangeOrder {
  id: string
  projectId?: string | null
  estimateScheduleId?: string | null
  companyProjectId?: string | null
  projectType?: ChangeOrderProjectType | string
  type?: string | null
  userId: string
  reasonForChange: string
  description: string
  originalCost: number
  additionalCost: number
  totalCost: number
  status?: string
  signature?: string | null
  documentation: string[]
  createdAt: string
  updatedAt: string
  estimateSchedule?: ChangeOrderEstimateSchedule | null
  user?: {
    id: string
    name?: string
    email?: string
    profile?: string
    contact?: string
    role?: string
  }
  companyProject?: ChangeOrderCompanyProject | null
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

export function getChangeOrderType(order: ChangeOrder): ChangeOrderProjectType {
  const explicit = (order.projectType ?? order.type ?? '').toLowerCase()
  if (explicit === 'company' || explicit === 'customer') {
    return explicit
  }
  if (order.companyProjectId || order.companyProject?.id) return 'company'
  if (order.estimateScheduleId || order.estimateSchedule?.id) return 'customer'
  return 'customer'
}

export function getChangeOrderEstimate(order: ChangeOrder): ChangeOrderEstimate | null {
  const fromSchedule = order.estimateSchedule?.estimate
  if (fromSchedule) return fromSchedule
  return order.project?.estimates ?? order.project?.estimate ?? null
}

export function getChangeOrderProjectName(order: ChangeOrder): string {
  return (
    order.companyProject?.projectName ??
    getChangeOrderEstimate(order)?.projectName ??
    order.projectName ??
    '—'
  )
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
  if (getChangeOrderType(order) === 'company') {
    return order.companyProject?.companyName ?? order.companyProject?.builder?.name ?? '—'
  }
  return getChangeOrderEstimate(order)?.clientName ?? '—'
}

export function getChangeOrderCustomerEmail(order: ChangeOrder): string {
  if (getChangeOrderType(order) === 'company') {
    return order.companyProject?.customerEmail ?? order.companyProject?.builder?.email ?? '—'
  }
  const estimate = getChangeOrderEstimate(order)
  return estimate?.customerEmail ?? estimate?.email ?? '—'
}

export function getChangeOrderCustomerPhone(order: ChangeOrder): string {
  return getChangeOrderEstimate(order)?.phone ?? '—'
}

export function getChangeOrderCompany(order: ChangeOrder): string {
  if (getChangeOrderType(order) === 'company') {
    return order.companyProject?.companyName ?? '—'
  }
  return getChangeOrderEstimate(order)?.company ?? '—'
}

