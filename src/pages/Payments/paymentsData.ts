import { DollarSign, CircleDollarSign, AlertCircle, FolderKanban } from 'lucide-react'
import type { PaymentEstimateApiDoc, PaymentUserApiDoc } from '@/redux/api/paymentApi'

/** UI model aligned with `GET /payment` response fields. */
export interface PaymentListItem {
  id: string
  userId: string
  estimateId: string
  amount: number | null
  receiverId: string | null
  note: string | null
  method: string
  checkImage: string | null
  checkImageUrl: string | null
  trxId: string | null
  stripePaymentIntentId: string | null
  stripeCheckoutSessionId: string | null
  status: string
  createdAt: string
  updatedAt: string
  resolverId: string | null
  financeCompanyName: string | null
  loanId: string | null
  projectName: string
  estimateTotalCost: number
  customerName: string
  customerEmail: string
  userProfileUrl: string | null
  estimate: PaymentEstimateApiDoc | null
  user: PaymentUserApiDoc | null
}

export const paymentStats = [
  {
    titleKey: 'payments.stats.totalCollected',
    valueGetter: (collected: number) => collected,
    icon: DollarSign,
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
  },
  {
    titleKey: 'payments.stats.totalOutstanding',
    valueGetter: (outstanding: number) => outstanding,
    icon: AlertCircle,
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
  },
  {
    titleKey: 'payments.stats.pendingApprovals',
    valueGetter: (pendingApprovals: number) => pendingApprovals,
    icon: CircleDollarSign,
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
  },
  {
    titleKey: 'payments.stats.totalProjects',
    valueGetter: (projectCount: number) => projectCount,
    icon: FolderKanban,
    iconBg: 'bg-violet-100',
    iconColor: 'text-violet-600',
  },
]

export function isRequestForCompleteStatus(status: string): boolean {
  return status?.toLowerCase() === 'request_for_complete'
}

export function formatPaymentMethod(method: string): string {
  switch (method?.toUpperCase()) {
    case 'CASH':
      return 'Cash'
    case 'CHEQUE':
      return 'Cheque'
    case 'CARD':
      return 'Card'
    case 'FINANCE':
      return 'Finance'
    default:
      return method || '—'
  }
}

export function isFinancePayment(method: string): boolean {
  return method?.toUpperCase() === 'FINANCE'
}
