import { baseApi } from '../baseApi'
import { normalizeProjectStatus, type EstimateRecord } from '@/pages/Estimate/estimateData'
import { formatDateDayMonth } from '@/utils/formatters'

export interface EstimatePagination {
  total: number
  page: number
  limit: number
  totalPage: number
}

export interface EstimateMaterialPayloadItem {
  materialId: string
  quantity: number
  unitPrice: number
  totalPrice: number
}

export interface EstimateEquipmentPayloadItem {
  equipmentId: string
  equipmentUnits: number
  unitPrice: number
  totalPrice: number
}

export interface EstimateVehiclePayloadItem {
  vehicleId: string
  vehicleUnits: number
  vehicleQuantity: number
  totalPrice: number
}

export interface EstimatePayload {
  projectName: string
  customerName: string
  customerEmail: string
  customerAddress: string
  totalDate: number
  description: string
  taxNumber: number
  materials: EstimateMaterialPayloadItem[]
  equipment: EstimateEquipmentPayloadItem[]
  vehicles: EstimateVehiclePayloadItem[]
}

export interface EstimateMaterialApiDoc extends EstimateMaterialPayloadItem {
  id: string
  estimateId: string
}

export interface EstimateVehicleApiDoc {
  id: string
  estimateId: string
  vehicleId: string
  vehicleUnits: number
  vehicleQuantity?: number
  totalPrice: number | null
  createdAt?: string
}

export interface EstimateEquipmentApiDoc {
  id: string
  estimateId: string
  equipmentId: string
  equipmentUnits: number
  unitPrice: number
  totalPrice?: number | null
}

export interface EstimateApiDoc {
  id: string
  projectName: string
  customerName: string
  customerEmail: string
  customerAddress: string
  estimateStartDate?: string
  estimateEndDate?: string
  totalDate?: number
  /** @deprecated Older API field — use `totalDate` */
  totalDays?: number
  description: string
  taxNumber: number
  userId: string
  isApproved: boolean
  projectStatus: string
  totalCost: number | null
  createdAt: string
  updatedAt: string
  materials: EstimateMaterialApiDoc[]
  equipment?: EstimateEquipmentApiDoc[]
  estimateEquipments?: EstimateEquipmentApiDoc[]
  vehicles: EstimateVehicleApiDoc[]
}

export interface EstimateListResponse {
  success: boolean
  statusCode?: number
  message: string
  pagination: EstimatePagination
  data: EstimateApiDoc[]
}

export interface EstimateMutationResponse {
  success: boolean
  statusCode?: number
  message: string
  data: EstimateApiDoc
}

export interface GetEstimatesParams {
  page?: number
  limit?: number
}

export function buildEstimatePayload(item: EstimateRecord): EstimatePayload {
  const materials = item.lineItems
    .filter((x) => x.lineType === 'material' && x.materialId)
    .map((x) => {
      const quantity = Number(x.quantity) || 0
      const unitPrice = Number(x.unitPrice) || 0
      return {
        materialId: x.materialId as string,
        quantity,
        unitPrice,
        totalPrice: quantity * unitPrice,
      }
    })

  const equipment = item.lineItems
    .filter((x) => x.lineType === 'equipment' && x.equipmentId)
    .map((x) => {
      const equipmentUnits = Number(x.quantity) || 0
      const unitPrice = Number(x.unitPrice) || 0
      return {
        equipmentId: x.equipmentId as string,
        equipmentUnits,
        unitPrice,
        totalPrice: equipmentUnits * unitPrice,
      }
    })

  const vehicles = item.lineItems
    .filter((x) => x.lineType === 'vehicle' && x.vehicleId)
    .map((x) => {
      const vehicleQuantity = Number(x.quantity) || 0
      const vehicleUnits = Number(x.unitPrice) || 0
      return {
        vehicleId: x.vehicleId as string,
        vehicleUnits,
        vehicleQuantity,
        totalPrice: vehicleQuantity * vehicleUnits,
      }
    })

  return {
    projectName: item.title,
    customerName: item.customerName,
    customerEmail: item.customerEmail,
    customerAddress: item.customerAddress,
    totalDate: Number(item.totalDays) || 0,
    description: item.description,
    taxNumber: Number(item.taxPercent) || 0,
    materials,
    equipment,
    vehicles,
  }
}

function formatDateForUi(date?: string): string {
  if (!date) return '—'
  const parsed = new Date(date)
  if (Number.isNaN(parsed.getTime())) return '—'
  return formatDateDayMonth(parsed)
}

function resolveEquipmentLines(doc: EstimateApiDoc) {
  const source = doc.estimateEquipments ?? doc.equipment ?? []
  return source.map((item) => {
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
      name: 'Equipment',
      lineType: 'equipment' as const,
      equipmentId: item.equipmentId,
      quantity: units,
      unitPrice,
      lineTotal: lineTotal ?? units * unitPrice,
    }
  })
}

export function mapEstimateFromApi(doc: EstimateApiDoc): EstimateRecord {
  const materialLines = (doc.materials ?? []).map((item) => ({
    id: item.id,
    name: 'Material',
    lineType: 'material' as const,
    materialId: item.materialId,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    lineTotal: item.totalPrice,
  }))

  const equipmentLines = resolveEquipmentLines(doc)

  const vehicleLines = (doc.vehicles ?? []).map((item) => {
    const vehicleQuantity =
      item.vehicleQuantity != null && item.vehicleQuantity > 0
        ? item.vehicleQuantity
        : item.vehicleUnits > 0 && item.totalPrice != null
          ? 1
          : 0
    const total = item.totalPrice != null ? Number(item.totalPrice) : 0
    const vehicleUnits = Number(item.vehicleUnits) || 0
    const unitPrice =
      vehicleQuantity > 0 && total > 0
        ? total / vehicleQuantity
        : vehicleUnits

    return {
      id: item.id,
      name: 'Vehicle',
      lineType: 'vehicle' as const,
      vehicleId: item.vehicleId,
      quantity: vehicleQuantity > 0 ? vehicleQuantity : vehicleUnits || 1,
      unitPrice,
      lineTotal: total > 0 ? total : undefined,
    }
  })

  const allLines = [...materialLines, ...equipmentLines, ...vehicleLines]

  const totalDays =
    typeof doc.totalDate === 'number'
      ? doc.totalDate
      : typeof doc.totalDays === 'number'
        ? doc.totalDays
        : undefined

  return {
    id: doc.id,
    title: doc.projectName,
    customerName: doc.customerName,
    customerEmail: doc.customerEmail,
    customerAddress: doc.customerAddress,
    location: doc.customerAddress || '—',
    paymentMethod: '—',
    description: doc.description ?? '',
    status: doc.isApproved ? 'signed' : 'pending',
    projectStatus: normalizeProjectStatus(doc.projectStatus),
    lineItems: allLines,
    taxPercent: Number(doc.taxNumber ?? 0),
    discount: null,
    signedAt: doc.isApproved ? doc.updatedAt : undefined,
    invoiceRef: undefined,
    totalDays,
    grandTotal: doc.totalCost ?? undefined,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
    createdAtDisplay: formatDateForUi(doc.createdAt),
    updatedAtDisplay: formatDateForUi(doc.updatedAt),
  }
}

const estimateApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getEstimates: builder.query<EstimateListResponse, GetEstimatesParams | void>({
      query: (params) => ({
        url: '/estimate-v-two',
        method: 'GET',
        params: {
          page: params?.page ?? 1,
          limit: params?.limit ?? 10,
        },
      }),
      providesTags: ['Estimate'],
    }),

    addEstimate: builder.mutation<EstimateMutationResponse, EstimatePayload>({
      query: (body) => ({
        url: '/estimate-v-two',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Estimate'],
    }),

    updateEstimate: builder.mutation<
      EstimateMutationResponse,
      { id: string } & EstimatePayload
    >({
      query: ({ id, ...body }) => ({
        url: `/estimate-v-two/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['Estimate'],
    }),

    deleteEstimate: builder.mutation<unknown, string>({
      query: (id) => ({
        url: `/estimate-v-two/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Estimate'],
    }),
  }),
})

export const {
  useGetEstimatesQuery,
  useAddEstimateMutation,
  useUpdateEstimateMutation,
  useDeleteEstimateMutation,
} = estimateApi
