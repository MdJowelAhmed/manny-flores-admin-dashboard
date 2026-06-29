import type {
  CreatePurchaseOrderPayload,
  RecordPurchaseOrderPaymentPayload,
  UpdatePurchaseOrderStatusPayload,
} from '@/redux/slices/super-admin/purchaseOrdersApi'
import type {
  PurchaseOrder,
  PurchaseOrdersOverview,
} from './purchaseOrdersData'
import {
  flattenPaymentTransactions,
  getOrderAmountPaid,
  getOrderRemainingDue,
  getPurchaseOrderBuilderEmail,
  getPurchaseOrderBuilderName,
  getPurchaseOrderNumber,
  getPurchaseOrderProjectName,
  normalizePurchaseOrderStatus,
} from './purchaseOrdersData'

const now = new Date()
const daysAgo = (n: number) => {
  const d = new Date(now)
  d.setDate(d.getDate() - n)
  return d.toISOString()
}
const daysAhead = (n: number) => {
  const d = new Date(now)
  d.setDate(d.getDate() + n)
  return d.toISOString()
}

const INITIAL_MOCK_ORDERS: PurchaseOrder[] = [
  {
    id: 'po-001',
    poNumber: 'PO-2026-001',
    builderId: 'builder-001',
    companyProjectId: 'proj-001',
    description: 'Landscape materials — sod, mulch, and irrigation supplies for front yard phase.',
    amount: 18500,
    status: 'PENDING',
    dueDate: daysAhead(14),
    notes: 'Awaiting builder confirmation before dispatch.',
    createdAt: daysAgo(2),
    updatedAt: daysAgo(2),
    builder: { id: 'builder-001', name: 'Green Valley Builders', email: 'greenvalley@example.com' },
    companyProject: { id: 'proj-001', projectName: 'Residential Backyard Renovation', companyName: 'STA' },
    paymentHistory: [],
  },
  {
    id: 'po-002',
    poNumber: 'PO-2026-002',
    builderId: 'builder-002',
    companyProjectId: 'proj-002',
    description: 'Hardscape pavers, sand, and edge restraints for patio installation.',
    amount: 24200,
    status: 'SENT',
    dueDate: daysAhead(7),
    notes: 'PO emailed to builder on file.',
    createdAt: daysAgo(6),
    updatedAt: daysAgo(4),
    builder: { id: 'builder-002', name: 'Summit Construction Co.', email: 'summit@example.com' },
    companyProject: { id: 'proj-002', projectName: 'Mobile App Development', companyName: 'STA' },
    paymentHistory: [],
  },
  {
    id: 'po-003',
    poNumber: 'PO-2026-003',
    builderId: 'builder-001',
    companyProjectId: 'proj-003',
    description: 'Lighting fixtures, low-voltage transformers, and wiring for landscape lighting.',
    amount: 9800,
    status: 'PAID',
    dueDate: daysAgo(5),
    paidAt: daysAgo(3),
    notes: 'Paid via company cheque.',
    createdAt: daysAgo(20),
    updatedAt: daysAgo(3),
    builder: { id: 'builder-001', name: 'Green Valley Builders', email: 'greenvalley@example.com' },
    companyProject: { id: 'proj-003', projectName: 'Office Park Landscaping', companyName: 'Metro Builders' },
    paymentHistory: [
      {
        id: 'pay-001',
        amount: 9800,
        paidAt: daysAgo(3),
        method: 'Cheque',
        note: 'Full settlement — Cheque #4521',
      },
    ],
  },
  {
    id: 'po-004',
    poNumber: 'PO-2026-004',
    builderId: 'builder-003',
    companyProjectId: 'proj-004',
    description: 'Tree planting, soil amendment, and staking materials.',
    amount: 12600,
    status: 'SENT',
    dueDate: daysAhead(10),
    createdAt: daysAgo(9),
    updatedAt: daysAgo(7),
    builder: { id: 'builder-003', name: 'Flores Design Group', email: 'flores.design@example.com' },
    companyProject: { id: 'proj-004', projectName: 'Kitchen Remodel', companyName: 'Dream Homes LLC' },
    paymentHistory: [],
  },
  {
    id: 'po-005',
    poNumber: 'PO-2026-005',
    builderId: 'builder-002',
    companyProjectId: 'proj-005',
    description: 'Pool equipment — pump, filter, and PVC fittings package.',
    amount: 31500,
    status: 'PAID',
    dueDate: daysAgo(12),
    paidAt: daysAgo(8),
    createdAt: daysAgo(30),
    updatedAt: daysAgo(8),
    builder: { id: 'builder-002', name: 'Summit Construction Co.', email: 'summit@example.com' },
    companyProject: { id: 'proj-005', projectName: 'Pool & Spa Installation', companyName: 'Elite Properties' },
    paymentHistory: [
      {
        id: 'pay-002',
        amount: 15000,
        paidAt: daysAgo(15),
        method: 'Bank Transfer',
        note: '50% deposit',
      },
      {
        id: 'pay-003',
        amount: 16500,
        paidAt: daysAgo(8),
        method: 'Bank Transfer',
        note: 'Final balance',
      },
    ],
  },
  {
    id: 'po-006',
    poNumber: 'PO-2026-006',
    builderId: 'builder-003',
    companyProjectId: 'proj-006',
    description: 'Artificial turf rolls, infill sand, and seam tape.',
    amount: 7400,
    status: 'PENDING',
    dueDate: daysAhead(21),
    createdAt: daysAgo(1),
    updatedAt: daysAgo(1),
    builder: { id: 'builder-003', name: 'Flores Design Group', email: 'flores.design@example.com' },
    companyProject: { id: 'proj-006', projectName: 'Parking Lot Paving', companyName: 'Retail Solutions Co' },
    paymentHistory: [],
  },
]

let mockOrdersStore: PurchaseOrder[] = INITIAL_MOCK_ORDERS.map((order) => ({ ...order }))

function cloneOrders(): PurchaseOrder[] {
  return mockOrdersStore.map((order) => ({
    ...order,
    builder: order.builder ? { ...order.builder } : null,
    companyProject: order.companyProject ? { ...order.companyProject } : null,
    paymentHistory: order.paymentHistory?.map((p) => ({ ...p })) ?? [],
  }))
}

export function computeMockOverview(orders: PurchaseOrder[]): PurchaseOrdersOverview {
  const pendingCount = orders.filter((o) => normalizePurchaseOrderStatus(o.status) === 'PENDING').length
  const sentCount = orders.filter((o) => normalizePurchaseOrderStatus(o.status) === 'SENT').length
  const paidCount = orders.filter((o) => normalizePurchaseOrderStatus(o.status) === 'PAID').length
  const totalAmount = orders.reduce((sum, o) => sum + o.amount, 0)
  const totalPaid = orders.reduce(
    (sum, o) => sum + (o.paymentHistory?.reduce((s, p) => s + p.amount, 0) ?? 0),
    0
  )

  return {
    totalOrders: orders.length,
    pendingCount,
    sentCount,
    paidCount,
    totalAmount,
    totalPaid,
    totalOutstanding: Math.max(0, totalAmount - totalPaid),
    transactions: flattenPaymentTransactions(orders),
  }
}

function matchesSearch(order: PurchaseOrder, search?: string): boolean {
  if (!search?.trim()) return true
  const q = search.trim().toLowerCase()
  return [
    getPurchaseOrderNumber(order),
    getPurchaseOrderProjectName(order),
    getPurchaseOrderBuilderName(order),
    getPurchaseOrderBuilderEmail(order),
    order.description,
  ].some((value) => value.toLowerCase().includes(q))
}

export function listMockPurchaseOrders(params: {
  search?: string
  page?: number
  limit?: number
  status?: string
  builderId?: string
}) {
  const page = params.page ?? 1
  const limit = params.limit ?? 10
  const status = params.status && params.status !== 'all' ? params.status.toUpperCase() : ''

  let filtered = cloneOrders().filter((order) => {
    const matchesBuilder = !params.builderId || order.builderId === params.builderId
    const matchesStatus =
      !status || normalizePurchaseOrderStatus(order.status) === normalizePurchaseOrderStatus(status)
    return matchesBuilder && matchesStatus && matchesSearch(order, params.search)
  })

  filtered = filtered.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )

  const total = filtered.length
  const totalPage = Math.max(1, Math.ceil(total / limit))
  const start = (page - 1) * limit
  const data = filtered.slice(start, start + limit)

  return {
    success: true,
    message: 'Mock purchase orders loaded',
    data,
    pagination: { total, page, limit, totalPage },
  }
}

export function getMockPurchaseOrdersOverview(builderId?: string) {
  const orders = builderId
    ? cloneOrders().filter((order) => order.builderId === builderId)
    : cloneOrders()

  return {
    success: true,
    message: 'Mock overview loaded',
    data: computeMockOverview(orders),
  }
}

export function createMockPurchaseOrder(payload: CreatePurchaseOrderPayload) {
  const id = `po-${Date.now()}`
  const seq = mockOrdersStore.length + 1
  const order: PurchaseOrder = {
    id,
    poNumber: `PO-2026-${String(seq).padStart(3, '0')}`,
    builderId: payload.builderId,
    companyProjectId: payload.companyProjectId ?? null,
    description: payload.description,
    amount: payload.amount,
    status: 'PENDING',
    dueDate: payload.dueDate ?? null,
    notes: payload.notes ?? null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    builder: { id: payload.builderId, name: 'Selected Builder', email: 'builder@example.com' },
    companyProject: payload.companyProjectId
      ? {
          id: payload.companyProjectId,
          projectName: payload.projectSnapshot?.projectName || 'Linked Project',
          companyName: payload.projectSnapshot?.companyName,
          totalBudget: payload.projectSnapshot?.totalBudget,
          payAmount: payload.projectSnapshot?.payAmount,
          amountDue: payload.projectSnapshot?.amountDue,
        }
      : null,
    paymentHistory: [],
  }

  mockOrdersStore = [order, ...mockOrdersStore]

  return {
    success: true,
    message: 'Mock purchase order created',
    data: order,
  }
}

export function updateMockPurchaseOrderStatus(payload: UpdatePurchaseOrderStatusPayload) {
  const index = mockOrdersStore.findIndex((o) => o.id === payload.id)
  if (index === -1) {
    return { error: { status: 404, data: { message: 'Purchase order not found' } } }
  }

  const existing = mockOrdersStore[index]
  const nextStatus = payload.status
  const updated: PurchaseOrder = {
    ...existing,
    status: nextStatus,
    updatedAt: new Date().toISOString(),
    paymentHistory: [...(existing.paymentHistory ?? [])],
  }

  if (nextStatus === 'PAID') {
    const paymentHistory = updated.paymentHistory ?? []
    const alreadyPaid = paymentHistory.reduce((s, p) => s + p.amount, 0)
    const remaining = Math.max(0, updated.amount - alreadyPaid)
    if (remaining > 0) {
      paymentHistory.push({
        id: `pay-${Date.now()}`,
        amount: remaining,
        paidAt: new Date().toISOString(),
        method: payload.paymentMethod || 'Manual',
        note: payload.paymentNote || 'Marked as paid',
      })
    }
    updated.paymentHistory = paymentHistory
    updated.paidAt = new Date().toISOString()
  }

  mockOrdersStore[index] = updated

  return {
    success: true,
    message: 'Mock purchase order updated',
    data: { ...updated, paymentHistory: (updated.paymentHistory ?? []).map((p) => ({ ...p })) },
  }
}

export function recordMockPurchaseOrderPayment(payload: RecordPurchaseOrderPaymentPayload) {
  const index = mockOrdersStore.findIndex((o) => o.id === payload.id)
  if (index === -1) {
    return { error: { status: 404, data: { message: 'Purchase order not found' } } }
  }

  const existing = mockOrdersStore[index]
  const currentStatus = normalizePurchaseOrderStatus(existing.status)

  if (currentStatus !== 'SENT' && currentStatus !== 'PAID') {
    return {
      error: {
        status: 400,
        data: { message: 'Payments can only be recorded on sent purchase orders.' },
      },
    }
  }

  const remaining = getOrderRemainingDue(existing)
  if (payload.amount <= 0 || payload.amount > remaining) {
    return {
      error: {
        status: 400,
        data: { message: 'Payment amount must be greater than zero and not exceed the remaining due.' },
      },
    }
  }

  const paymentHistory = [...(existing.paymentHistory ?? [])]
  paymentHistory.push({
    id: `pay-${Date.now()}`,
    amount: payload.amount,
    paidAt: new Date().toISOString(),
    method: payload.method || 'Manual',
    note: payload.note || 'Payment recorded',
  })

  const totalPaid = getOrderAmountPaid({ ...existing, paymentHistory })
  const isFullyPaid = totalPaid >= existing.amount

  const updated: PurchaseOrder = {
    ...existing,
    status: isFullyPaid ? 'PAID' : existing.status,
    paidAt: isFullyPaid ? new Date().toISOString() : existing.paidAt,
    updatedAt: new Date().toISOString(),
    paymentHistory,
  }

  mockOrdersStore[index] = updated

  return {
    success: true,
    message: 'Payment recorded successfully',
    data: { ...updated, paymentHistory: paymentHistory.map((p) => ({ ...p })) },
  }
}

export function resetMockPurchaseOrders() {
  mockOrdersStore = INITIAL_MOCK_ORDERS.map((order) => ({ ...order }))
}
