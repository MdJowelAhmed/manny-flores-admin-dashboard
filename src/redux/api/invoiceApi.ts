import { baseApi } from '../baseApi'
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
  const materials = (doc.materials ?? []).map((item) => ({
    id: item.id,
    category: 'Material',
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    unitSuffix: 'unit' as const,
  }))

  const vehicles = (doc.vehicles ?? []).map((item) => {
    const quantity = item.vehicleQuantity ?? 1
    const vehicleUnits = Number(item.vehicleUnits) || 0
    const total = item.totalPrice != null ? Number(item.totalPrice) : 0
    const unitPrice =
      quantity > 0 && total > 0 ? total / quantity : vehicleUnits

    return {
      id: item.id,
      category: 'Vehicle',
      quantity,
      unitPrice,
      unitSuffix: 'day' as const,
    }
  })

  return [...materials, ...vehicles]
}

export function mapInvoiceFromApi(doc: InvoiceApiDoc): InvoiceRecord {
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
