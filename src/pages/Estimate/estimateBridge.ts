import type { InvoiceRecord } from '@/pages/Invoice/invoiceData'
import type { ScheduledProject } from '@/pages/ProjectScheduling/projectSchedulingData'

const INVOICE_KEY = 'mf_pending_invoices'
const SCHEDULE_KEY = 'mf_pending_schedules'

function readJson<T>(key: string): T[] {
  try {
    const raw = sessionStorage.getItem(key)
    if (!raw) return []
    const parsed = JSON.parse(raw) as T[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeJson<T>(key: string, items: T[]) {
  sessionStorage.setItem(key, JSON.stringify(items))
}

export function queueInvoiceFromEstimate(invoice: InvoiceRecord) {
  const next = [invoice, ...readJson<InvoiceRecord>(INVOICE_KEY)]
  writeJson(INVOICE_KEY, next)
}

export function consumePendingInvoices(): InvoiceRecord[] {
  const items = readJson<InvoiceRecord>(INVOICE_KEY)
  sessionStorage.removeItem(INVOICE_KEY)
  return items
}

export function queueScheduleFromEstimate(schedule: ScheduledProject) {
  const next = [schedule, ...readJson<ScheduledProject>(SCHEDULE_KEY)]
  writeJson(SCHEDULE_KEY, next)
}

export function consumePendingSchedules(): ScheduledProject[] {
  const items = readJson<ScheduledProject>(SCHEDULE_KEY)
  sessionStorage.removeItem(SCHEDULE_KEY)
  return items
}
