import { formatDateISO, formatDateDayMonth } from '@/utils/formatters'
import type { InvoiceLineItem, InvoiceRecord } from '@/pages/Invoice/invoiceData'
import type { ScheduledProject } from '@/pages/ProjectScheduling/projectSchedulingData'
import type { EstimateRecord } from './estimateData'
import { queueInvoiceFromEstimate, queueScheduleFromEstimate } from './estimateBridge'

function makeId(prefix: string) {
  const cryptoAny = crypto as unknown as { randomUUID?: () => string }
  return cryptoAny?.randomUUID
    ? `${prefix}-${cryptoAny.randomUUID()}`
    : `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function parseIsoDate(iso?: string): Date {
  if (!iso?.trim()) return new Date()
  const parsed = new Date(iso)
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed
}

function addDays(iso: string, days: number): string {
  const d = parseIsoDate(iso)
  d.setDate(d.getDate() + (Number(days) || 0))
  return d.toISOString()
}

export function createInvoiceFromEstimate(estimate: EstimateRecord): InvoiceRecord {
  const issuedIso = estimate.createdAt ?? new Date().toISOString()
  const days = estimate.totalDays ?? 0
  const dueIso = days > 0 ? addDays(issuedIso, days) : issuedIso
  const year = parseIsoDate(issuedIso).getFullYear()
  const short = String(Math.floor(100 + Math.random() * 900))

  const lineItems: InvoiceLineItem[] = estimate.lineItems.map((row) => ({
    id: makeId('li'),
    category: row.name,
    quantity: row.quantity,
    unitPrice: row.unitPrice,
    unitSuffix: 'unit',
  }))

  return {
    id: makeId('inv'),
    customerName: estimate.customerName,
    customerAddress: estimate.customerAddress || estimate.location,
    invoiceRef: `#INV-${year}-${short}`,
    issuedDate: formatDateISO(parseIsoDate(issuedIso)),
    dueDate: formatDateISO(parseIsoDate(dueIso)),
    taxPercent: estimate.taxPercent,
    lineItems,
  }
}

export function createScheduleFromEstimate(estimate: EstimateRecord): ScheduledProject {
  const startIso = estimate.createdAt ?? new Date().toISOString()
  const days = estimate.totalDays ?? 0
  const endIso = days > 0 ? addDays(startIso, days) : startIso
  const scheduledDisplay = formatDateDayMonth(parseIsoDate(startIso))

  return {
    id: makeId('sch'),
    estimateId: estimate.id,
    status: 'PENDING',
    projectStatus: estimate.projectStatus,
    scheduledDate: scheduledDisplay,
    estimateStartDate: startIso,
    estimateEndDate: endIso,
    projectTitle: estimate.title,
    category: estimate.description?.trim() || '—',
    project: estimate.title,
    uploadDate: scheduledDisplay,
    uploadedBy: estimate.customerName,
    team: '',
    customer: estimate.customerName,
    email: estimate.customerEmail || '',
    company: estimate.customerName,
    serviceLocation: estimate.location,
    eta: '',
    assignedAvatarUrls: [],
    assignedEmployeeIds: [],
    assignedEmployees: [],
  }
}

export function runEstimateSignedWorkflow(estimate: EstimateRecord) {
  const invoice = createInvoiceFromEstimate(estimate)
  const schedule = createScheduleFromEstimate(estimate)
  queueInvoiceFromEstimate(invoice)
  queueScheduleFromEstimate(schedule)
  return { invoice, schedule }
}
