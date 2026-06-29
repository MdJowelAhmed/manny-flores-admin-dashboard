import { Clock, Send, CircleDollarSign, Receipt } from 'lucide-react'

export type PurchaseOrderStatus = 'PENDING' | 'SENT' | 'PAID'

export interface PurchaseOrderPayment {
  id: string
  amount: number
  paidAt: string
  method?: string | null
  note?: string | null
}

export interface PurchaseOrderBuilder {
  id: string
  name?: string
  email?: string
  contact?: string | null
}

export interface PurchaseOrderProject {
  id: string
  projectName?: string
  companyName?: string
  totalBudget?: number
  payAmount?: number
  amountDue?: number
}

export interface PurchaseOrderTransaction {
  id: string
  poId: string
  poNumber: string
  projectName: string
  amount: number
  paidAt: string
  method?: string | null
  note?: string | null
}

export interface PurchaseOrder {
  id: string
  poNumber?: string
  builderId: string
  companyProjectId?: string | null
  description: string
  amount: number
  status?: string
  dueDate?: string | null
  paidAt?: string | null
  notes?: string | null
  createdAt: string
  updatedAt: string
  builder?: PurchaseOrderBuilder | null
  companyProject?: PurchaseOrderProject | null
  paymentHistory?: PurchaseOrderPayment[]
}

export interface PurchaseOrdersOverview {
  totalOrders: number
  pendingCount: number
  sentCount: number
  paidCount: number
  totalAmount: number
  totalPaid: number
  totalOutstanding: number
  transactions?: PurchaseOrderTransaction[]
}

export const purchaseOrderStats = [
  {
    titleKey: 'purchaseOrders.totalOrders' as const,
    valueKey: 'totalOrders' as const,
    icon: Receipt,
    iconBg: 'bg-purple-100',
    iconColor: 'text-purple-600',
  },
  {
    titleKey: 'purchaseOrders.pendingOrders' as const,
    valueKey: 'pendingCount' as const,
    icon: Clock,
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
  },
  {
    titleKey: 'purchaseOrders.sentOrders' as const,
    valueKey: 'sentCount' as const,
    icon: Send,
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
  },
  {
    titleKey: 'purchaseOrders.totalSettled' as const,
    valueKey: 'totalPaid' as const,
    icon: CircleDollarSign,
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
    isCurrency: true,
  },
]

export const statusFilterOptions = [
  { value: 'all', labelKey: 'common.all' as const },
  { value: 'PENDING', labelKey: 'purchaseOrders.statusPending' as const },
  { value: 'SENT', labelKey: 'purchaseOrders.statusSent' as const },
  { value: 'PAID', labelKey: 'purchaseOrders.statusPaid' as const },
]

export const statusUpdateOptions: { value: PurchaseOrderStatus; labelKey: string }[] = [
  { value: 'PENDING', labelKey: 'purchaseOrders.statusPending' },
  { value: 'SENT', labelKey: 'purchaseOrders.statusSent' },
  { value: 'PAID', labelKey: 'purchaseOrders.statusPaid' },
]

export function normalizePurchaseOrderStatus(status?: string | null): PurchaseOrderStatus {
  const upper = (status ?? 'PENDING').toUpperCase()
  if (upper === 'SENT' || upper === 'PAID') return upper
  return 'PENDING'
}

export function getPurchaseOrderStatusLabel(status?: string | null): string {
  switch (normalizePurchaseOrderStatus(status)) {
    case 'SENT':
      return 'Sent'
    case 'PAID':
      return 'Paid'
    default:
      return 'Pending'
  }
}

export function getPurchaseOrderNumber(order: PurchaseOrder): string {
  return order.poNumber || `PO-${order.id.slice(0, 8).toUpperCase()}`
}

export function getPurchaseOrderBuilderName(order: PurchaseOrder): string {
  return order.builder?.name || '—'
}

export function getPurchaseOrderBuilderEmail(order: PurchaseOrder): string {
  return order.builder?.email || '—'
}

export function getPurchaseOrderProjectName(order: PurchaseOrder): string {
  return order.companyProject?.projectName || order.companyProject?.companyName || '—'
}

export function getPurchaseOrderStatusClass(status?: string | null): string {
  switch (normalizePurchaseOrderStatus(status)) {
    case 'SENT':
      return 'bg-blue-100 text-blue-800'
    case 'PAID':
      return 'bg-emerald-100 text-emerald-800'
    default:
      return 'bg-amber-100 text-amber-800'
  }
}

export function getOrderAmountPaid(order: PurchaseOrder): number {
  return (order.paymentHistory ?? []).reduce((sum, item) => sum + (item.amount ?? 0), 0)
}

export function getOrderRemainingDue(order: PurchaseOrder): number {
  return Math.max(0, order.amount - getOrderAmountPaid(order))
}

export function flattenPaymentTransactions(orders: PurchaseOrder[]): PurchaseOrderTransaction[] {
  return orders
    .flatMap((order) =>
      (order.paymentHistory ?? []).map((payment) => ({
        id: payment.id,
        poId: order.id,
        poNumber: getPurchaseOrderNumber(order),
        projectName: getPurchaseOrderProjectName(order),
        amount: payment.amount,
        paidAt: payment.paidAt,
        method: payment.method,
        note: payment.note,
      }))
    )
    .sort((a, b) => new Date(b.paidAt).getTime() - new Date(a.paidAt).getTime())
}

export const purchaseOrderPaymentMethods = [
  { value: 'CASH', labelKey: 'purchaseOrders.methodCash' as const },
  { value: 'CHEQUE', labelKey: 'purchaseOrders.methodCheque' as const },
  { value: 'BANK_TRANSFER', labelKey: 'purchaseOrders.methodBankTransfer' as const },
  { value: 'ONLINE', labelKey: 'purchaseOrders.methodOnline' as const },
]
