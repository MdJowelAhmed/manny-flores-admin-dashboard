import { FileText, Info, DollarSign } from 'lucide-react'

export type ChangeOrderStatus = 'Pending' | 'Approved'

export interface ChangeOrder {
  id: string
  projectId: string
  userId: string
  reasonForChange: string
  description: string
  originalCost: number
  additionalCost: number
  totalCost: number
  documentation: string[]
  createdAt: string
  updatedAt: string
  project?: {
    id: string
    estimateId: string
    invoiceWithSignaturesId?: string
    status: string
    clientId: string
    createdAt: string
    updatedAt: string
    estimates?: {
      projectName?: string
      clientName?: string
      phone?: string
      email?: string
      company?: string
      siteAddress?: string
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
  status?: string
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

