import { formatDateISO } from '@/utils/formatters'
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

function parseDisplayDate(value: string): Date {
  const trimmed = value.trim()
  if (!trimmed) return new Date()
  const parsed = new Date(trimmed)
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed
}

export function createInvoiceFromEstimate(estimate: EstimateRecord): InvoiceRecord {
  const issued = parseDisplayDate(estimate.deadlineFrom)
  const due = parseDisplayDate(estimate.deadlineTo)
  const year = issued.getFullYear()
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
    issuedDate: formatDateISO(issued),
    dueDate: formatDateISO(due > issued ? due : issued),
    taxPercent: estimate.taxPercent,
    lineItems,
  }
}

export function createScheduleFromEstimate(estimate: EstimateRecord): ScheduledProject {
  const scheduledDate = estimate.deadlineFrom.trim() || estimate.deadlineTo.trim() || 'TBD'

  return {
    id: makeId('sch'),
    scheduledDate,
    projectTitle: estimate.title,
    category: 'Estimate',
    project: estimate.title,
    uploadDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    uploadedBy: 'System',
    team: 'Team A',
    customer: estimate.customerName,
    email: estimate.customerEmail || '',
    company: estimate.customerName,
    serviceLocation: estimate.location,
    eta: '09:00 AM',
    assignedAvatarUrls: [],
  }
}

export function runEstimateSignedWorkflow(estimate: EstimateRecord) {
  const invoice = createInvoiceFromEstimate(estimate)
  const schedule = createScheduleFromEstimate(estimate)
  queueInvoiceFromEstimate(invoice)
  queueScheduleFromEstimate(schedule)
  return { invoice, schedule }
}
