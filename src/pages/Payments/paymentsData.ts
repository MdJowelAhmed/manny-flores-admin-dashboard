import { DollarSign, CircleDollarSign, AlertCircle, FolderKanban } from 'lucide-react'

export type PaymentMethod = 'cash' | 'check' | 'card' | 'financing'
export type PaymentStatus = 'pending' | 'partially_paid' | 'paid'

export interface PaymentRecord {
  id: string
  paymentId: string
  projectName: string
  customerName: string
  method: PaymentMethod
  totalAmount: number
  paidAmount: number
  status: PaymentStatus
  receivedAt: string // ISO
  receivedBy: string
  /**
   * Approval hierarchy:
   * - cash: staff/admin can record as received, but only super-admin can confirm + mark Paid
   * - check: requires proof before marking Paid
   */
  cashReceivedRecorded?: boolean
  cashFinalApproved?: boolean
  proofImageUrl?: string
  notes?: string
}

export const mockPayments: PaymentRecord[] = [
  {
    id: 'pay-1',
    paymentId: '#P-10021',
    projectName: 'Residential Backyard Renovation',
    customerName: 'John Davis',
    method: 'cash',
    totalAmount: 5200,
    paidAmount: 0,
    status: 'pending',
    receivedAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
    receivedBy: 'Staff Admin',
    cashReceivedRecorded: true,
    cashFinalApproved: false,
    notes: 'Cash received by staff; waiting for Manny confirmation.',
  },
  {
    id: 'pay-2',
    paymentId: '#P-10022',
    projectName: 'Office Park Landscaping',
    customerName: 'Acme Corp',
    method: 'check',
    totalAmount: 12400,
    paidAmount: 12400,
    status: 'paid',
    receivedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    receivedBy: 'Manager',
    proofImageUrl: '/assets/check-proof-sample.png',
  },
  {
    id: 'pay-3',
    paymentId: '#P-10023',
    projectName: 'Kitchen Remodel – Downtown',
    customerName: 'Maria Gomez',
    method: 'financing',
    totalAmount: 18900,
    paidAmount: 7200,
    status: 'partially_paid',
    receivedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6).toISOString(),
    receivedBy: 'Manager',
  },
  {
    id: 'pay-4',
    paymentId: '#P-10024',
    projectName: 'Poolside Patio Upgrade',
    customerName: 'Ethan Clark',
    method: 'card',
    totalAmount: 3400,
    paidAmount: 3400,
    status: 'paid',
    receivedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    receivedBy: 'Staff Admin',
  },
  {
    id: 'pay-5',
    paymentId: '#P-10025',
    projectName: 'Garden Design & Installation',
    customerName: 'Olivia Chen',
    method: 'check',
    totalAmount: 8600,
    paidAmount: 0,
    status: 'pending',
    receivedAt: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
    receivedBy: 'Manager',
    notes: 'Check received; proof not uploaded yet.',
  },
]

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

