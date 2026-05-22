import { baseApi, imageUrl } from '../baseApi'
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

export interface InvoiceApiSignature {
  id: string
  estimateId: string
  customerSignature: string
  providerSignature?: string | null
  isProvideSignature: boolean
  createdAt?: string
  updatedAt?: string
  userId?: string
}

export interface InvoiceApiDoc {
  id: string
  projectName: string
  customerName: string
  customerEmail: string
  customerAddress: string
  estimateStartDate: string
  estimateEndDate: string
  description: string
  taxNumber: number
  userId: string
  isApproved: boolean
  projectStatus: string
  totalCost: number | null
  createdAt: string
  updatedAt: string
  materials: InvoiceMaterialApiDoc[]
  vehicles: InvoiceVehicleApiDoc[]
  estimateEquipments?: InvoiceEquipmentApiDoc[]
  equipment?: InvoiceEquipmentApiDoc[]
  invoiceWithSignatures?: InvoiceApiSignature | null
  customerSignature?: string | null
  isProvideSignature?: boolean
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

function formatInvoiceRef(id: string): string {
  const short = id.includes('-') ? id.split('-')[0] : id.slice(0, 8)
  return `#INV-${short}`
}

function mapLineItems(doc: InvoiceApiDoc): InvoiceLineItem[] {
  const materials: InvoiceLineItem[] = (doc.materials ?? []).map((item) => ({
    id: item.id,
    category: 'Material',
    lineType: 'material',
    materialId: item.materialId,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    unitSuffix: 'unit',
    lineTotal: item.totalPrice,
  }))

  const equipmentSource = doc.estimateEquipments ?? doc.equipment ?? []
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

  const vehicles: InvoiceLineItem[] = (doc.vehicles ?? []).map((item) => {
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

function signatureUrl(raw?: string | null): string | null {
  if (!raw?.trim()) return null
  if (raw.startsWith('http') || raw.startsWith('data:')) return raw
  const base = imageUrl?.replace(/\/$/, '') ?? ''
  const path = raw.startsWith('/') ? raw : `/${raw}`
  return `${base}${path}`
}

export function mapInvoiceFromApi(doc: InvoiceApiDoc): InvoiceRecord {
  const sigRaw =
    doc.invoiceWithSignatures?.customerSignature ?? doc.customerSignature ?? null
  const providerSigRaw = doc.invoiceWithSignatures?.providerSignature ?? null
  const hasSig =
    doc.invoiceWithSignatures?.isProvideSignature ?? doc.isProvideSignature ?? !!sigRaw

  return {
    id: doc.id,
    customerName: doc.customerName,
    customerEmail: doc.customerEmail,
    customerAddress: doc.customerAddress,
    projectName: doc.projectName,
    invoiceRef: formatInvoiceRef(doc.id),
    issuedDate: doc.estimateStartDate,
    dueDate: doc.estimateEndDate,
    issuedDateDisplay: formatDateForUi(doc.estimateStartDate),
    dueDateDisplay: formatDateForUi(doc.estimateEndDate),
    taxPercent: Number(doc.taxNumber ?? 0),
    lineItems: mapLineItems(doc),
    totalCost: doc.totalCost,
    projectStatus: normalizeProjectStatus(doc.projectStatus),
    description: doc.description,
    isApproved: doc.isApproved,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
    customerSignature: signatureUrl(sigRaw),
    providerSignature: signatureUrl(providerSigRaw),
    isProvideSignature: hasSig,
    signedAt: doc.invoiceWithSignatures?.createdAt,
  }
}

function formatDateForUi(date: string): string {
  const parsed = new Date(date)
  if (Number.isNaN(parsed.getTime())) return '—'
  return formatDateDayMonth(parsed)
}

const invoiceApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getInvoices: builder.query<InvoiceListResponse, GetInvoicesParams | void>({
      query: (params) => ({
        url: '/invoice/admin',
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
