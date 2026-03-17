import { FileText, Info, DollarSign } from 'lucide-react'

export type ChangeOrderStatus = 'Pending' | 'Approved'

export interface ChangeOrder {
  id: string
  orderId: string
  customerName: string
  projectName: string
  company: string
  originalCost: number
  additionalCost: number
  newTotal: number
  requestDate: string
  status: ChangeOrderStatus
  projectStartDate: string
  amountSpent: number
  totalBudget: number
  duration: string
  remaining: number
  email: string
  reasonForChange: string
}

export const changeOrderStats = [
  { titleKey: 'changeOrders.totalChangeOrders' as const, value: 8, icon: FileText, iconBg: 'bg-purple-100', iconColor: 'text-purple-600' },
  { titleKey: 'changeOrders.awaitingResponse' as const, value: 2, icon: Info, iconBg: 'bg-amber-100', iconColor: 'text-amber-600' },
  { titleKey: 'changeOrders.totalAdditionalRevenue' as const, value: 34500, icon: DollarSign, iconBg: 'bg-emerald-100', iconColor: 'text-emerald-600' },
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

export const mockChangeOrders: ChangeOrder[] = [
  {
    id: 'co-1',
    orderId: 'CO-2026-012',
    customerName: 'Mike Johnson',
    projectName: 'Residential Backyard Renovation',
    company: 'Lawn Care Package',
    originalCost: 45000,
    additionalCost: 8500,
    newTotal: 53500,
    requestDate: 'Feb 18, 2026',
    status: 'Pending',
    projectStartDate: 'January 15, 2026',
    amountSpent: 28500,
    totalBudget: 45000,
    duration: '8 weeks',
    remaining: 16500,
    email: 'john@email.com',
    reasonForChange:
      'Customer requested to expand patio area during site visit on Feb 16, 2026. Additional space needed for outdoor dining furniture and built-in grill station.',
  },
  {
    id: 'co-2',
    orderId: 'CO-2026-011',
    customerName: 'John Smith',
    projectName: 'Residential Backyard Renovation',
    company: 'Lawn Care Package',
    originalCost: 45000,
    additionalCost: 8500,
    newTotal: 53500,
    requestDate: 'Feb 18, 2026',
    status: 'Approved',
    projectStartDate: 'January 15, 2026',
    amountSpent: 28500,
    totalBudget: 45000,
    duration: '8 weeks',
    remaining: 16500,
    email: 'john@email.com',
    reasonForChange:
      'Customer requested to expand patio area during site visit on Feb 16, 2026. Additional space needed for outdoor dining furniture and built-in grill station.',
  },
]
