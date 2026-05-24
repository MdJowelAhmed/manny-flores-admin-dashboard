import { baseApi } from '../baseApi'
import { imageUrl as toImagePath } from '@/components/common/getImageUrl'
import { normalizeProjectStatus } from '@/pages/Estimate/estimateData'
import type { InvoiceLineItem, InvoiceRecord } from '@/pages/Invoice/invoiceData'
import { formatDateDayMonth } from '@/utils/formatters'

export interface InvoicePagination {
  total: number
  page: number
  limit: number
  totalPage: number
}

export interface InvoiceMaterialApiDoc {
  id: string
  estimateId: string
  materialId: string
  quantity: number
  unitPrice: number
  totalPrice: number
  createdAt?: string
}

export interface InvoiceVehicleApiDoc {
  id: string
  estimateId: string
  vehicleId: string
  vehicleUnits: number
  vehicleQuantity?: number
  totalPrice: number | null
  createdAt?: string
}

export interface InvoiceEquipmentApiDoc {
  id: string
  estimateId: string
  equipmentId: string
  equipmentUnits: number
  unitPrice: number
  totalPrice?: number | null
  createdAt?: string
}

export interface EstimateApprovalApiDoc {
  id: string
  estimateId: string
  signature: string
  estimateStatus: string
  customerEmail: string
  customerName: string
  createdAt: string
  updatedAt: string
}

export interface InvoiceEstimateApiDoc {
  id: string
  projectName: string
  projectStatus: string
  customerName: string
  customerEmail: string
  customerAddress: string
  totalDate: number
  description: string
  taxNumber: number
  isApproved: boolean
  totalCost: number | null
  userId: string
  createdAt: string
  updatedAt: string
  materials: InvoiceMaterialApiDoc[]
  vehicles: InvoiceVehicleApiDoc[]
  equipment?: InvoiceEquipmentApiDoc[]
  estimateEquipments?: InvoiceEquipmentApiDoc[]
  estimateApprovals?: EstimateApprovalApiDoc[]
}

export interface InvoiceApiDoc {
  id: string
  estimateId: string
  invoiceNumber: string
  createdAt: string
  updatedAt: string
  estimate: InvoiceEstimateApiDoc
}

export interface InvoiceListResponse {
  success: boolean
  statusCode?: number
  message: string
  pagination: InvoicePagination
  data: InvoiceApiDoc[]
}

export interface GetInvoicesParams {
  page?: number
  limit?: number
}

/** Resolve a signature/upload value to a relative `/uploads/...` path
 *  using the shared `getImageUrl` helper. In dev, Vite proxies `/uploads`
 *  to the API host so `<img>` tags can load without auth/CORS issues. */
export function resolveSignatureUrl(raw?: string | null): string | null {
  if (!raw || typeof raw !== 'string' || !raw.trim()) return null
  if (raw.startsWith('data:') || raw.startsWith('blob:')) return raw
  const path = toImagePath(raw)
  return path || null
}

function mapLineItems(estimate: InvoiceEstimateApiDoc): InvoiceLineItem[] {
  const materials: InvoiceLineItem[] = (estimate.materials ?? []).map((item) => ({
    id: item.id,
    category: 'Material',
    lineType: 'material',
    materialId: item.materialId,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    unitSuffix: 'unit',
    lineTotal: item.totalPrice,
  }))

  const equipmentSource = estimate.estimateEquipments ?? estimate.equipment ?? []
  const equipment: InvoiceLineItem[] = equipmentSource.map((item) => {
    const units = Number(item.equipmentUnits) || 0
    const lineTotal = item.totalPrice != null ? Number(item.totalPrice) : null
    const unitPrice =
      Number(item.unitPrice) > 0
        ? Number(item.unitPrice)
        : units > 0 && lineTotal != null && lineTotal > 0
          ? lineTotal / units
          : lineTotal ?? 0

    return {
      id: item.id,
      category: 'Equipment',
      lineType: 'equipment',
      equipmentId: item.equipmentId,
      quantity: units,
      unitPrice,
      unitSuffix: 'day',
      lineTotal: lineTotal ?? units * unitPrice,
    }
  })

  const vehicles: InvoiceLineItem[] = (estimate.vehicles ?? []).map((item) => {
    const quantity = item.vehicleQuantity ?? 1
    const vehicleUnits = Number(item.vehicleUnits) || 0
    const total = item.totalPrice != null ? Number(item.totalPrice) : 0
    const unitPrice =
      quantity > 0 && total > 0 ? total / quantity : vehicleUnits

    return {
      id: item.id,
      category: 'Vehicle',
      lineType: 'vehicle',
      vehicleId: item.vehicleId,
      quantity,
      unitPrice,
      unitSuffix: 'day',
      lineTotal: total > 0 ? total : quantity * unitPrice,
    }
  })

  return [...materials, ...equipment, ...vehicles]
}

function addDays(iso: string, days: number): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  d.setDate(d.getDate() + (Number(days) || 0))
  return d.toISOString()
}

function formatDateForUi(date?: string): string {
  if (!date) return '—'
  const parsed = new Date(date)
  if (Number.isNaN(parsed.getTime())) return '—'
  return formatDateDayMonth(parsed)
}

function pickLatestApproval(
  approvals?: EstimateApprovalApiDoc[]
): EstimateApprovalApiDoc | null {
  if (!approvals?.length) return null
  return [...approvals].sort((a, b) => {
    const ta = new Date(a.createdAt).getTime() || 0
    const tb = new Date(b.createdAt).getTime() || 0
    return tb - ta
  })[0]
}

export function mapInvoiceFromApi(doc: InvoiceApiDoc): InvoiceRecord {
  const estimate = doc.estimate ?? ({} as InvoiceEstimateApiDoc)
  const totalDate = Number(estimate.totalDate) || 0
  const issuedDateIso = doc.createdAt ?? estimate.createdAt ?? ''
  const dueDateIso = issuedDateIso ? addDays(issuedDateIso, totalDate) : ''

  const latestApproval = pickLatestApproval(estimate.estimateApprovals)
  const customerSignature = resolveSignatureUrl(latestApproval?.signature)
  const isApproved =
    estimate.isApproved ||
    (latestApproval?.estimateStatus ?? '').toUpperCase() === 'APPROVED' ||
    !!customerSignature

  return {
    id: doc.id,
    customerName: estimate.customerName ?? latestApproval?.customerName ?? '',
    customerEmail: estimate.customerEmail ?? latestApproval?.customerEmail ?? '',
    customerAddress: estimate.customerAddress ?? '',
    projectName: estimate.projectName,
    invoiceRef: doc.invoiceNumber ? `#${doc.invoiceNumber}` : `#INV-${doc.id.slice(0, 8)}`,
    issuedDate: issuedDateIso,
    dueDate: dueDateIso,
    issuedDateDisplay: formatDateForUi(issuedDateIso),
    dueDateDisplay: formatDateForUi(dueDateIso),
    taxPercent: Number(estimate.taxNumber ?? 0),
    lineItems: mapLineItems(estimate),
    totalCost: estimate.totalCost,
    projectStatus: normalizeProjectStatus(estimate.projectStatus),
    description: estimate.description,
    isApproved,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
    customerSignature,
    providerSignature: null,
    isProvideSignature: !!customerSignature,
    signedAt: latestApproval?.createdAt ?? doc.createdAt,
  }
}

const invoiceApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getInvoices: builder.query<InvoiceListResponse, GetInvoicesParams | void>({
      query: (params) => ({
        url: '/estimate-invoices',
        method: 'GET',
        params: {
          page: params?.page ?? 1,
          limit: params?.limit ?? 10,
        },
      }),
      providesTags: ['Invoice'],
    }),
  }),
})

export const { useGetInvoicesQuery } = invoiceApi
