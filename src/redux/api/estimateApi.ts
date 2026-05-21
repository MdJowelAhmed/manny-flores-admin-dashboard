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
}

export interface EstimateVehiclePayloadItem {
  vehicleId: string
  vehicleUnits: number
  totalPrice?: number | null
}

export interface EstimatePayload {
  projectName: string
  customerName: string
  customerEmail: string
  customerAddress: string
  estimateStartDate: string
  estimateEndDate: string
  description: string
  taxNumber: number
  materials: EstimateMaterialPayloadItem[]
  equipment?: EstimateEquipmentPayloadItem[]
  vehicles: EstimateVehiclePayloadItem[]
}

export interface EstimateMaterialApiDoc extends EstimateMaterialPayloadItem {
  id: string
  estimateId: string
}

export interface EstimateVehicleApiDoc extends EstimateVehiclePayloadItem {
  id: string
  estimateId: string
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
  materials: EstimateMaterialApiDoc[]
  equipment?: EstimateEquipmentApiDoc[]
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

function formatDateForUi(date: string): string {
  const parsed = new Date(date)
  if (Number.isNaN(parsed.getTime())) return '—'
  return formatDateDayMonth(parsed)
}

export function mapEstimateFromApi(doc: EstimateApiDoc): EstimateRecord {
  const materialLines = (doc.materials ?? []).map((item) => ({
    id: item.id,
    name: 'Material',
    lineType: 'material' as const,
    materialId: item.materialId,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
  }))

  const equipmentLines = (doc.equipment ?? []).map((item) => ({
    id: item.id,
    name: 'Equipment',
    lineType: 'equipment' as const,
    equipmentId: item.equipmentId,
    quantity: item.equipmentUnits,
    unitPrice: item.unitPrice,
  }))

  const vehicleLines = (doc.vehicles ?? []).map((item) => ({
    id: item.id,
    name: 'Vehicle',
    lineType: 'vehicle' as const,
    vehicleId: item.vehicleId,
    quantity: item.vehicleUnits,
    unitPrice:
      item.vehicleUnits > 0 && item.totalPrice
        ? Number(item.totalPrice) / item.vehicleUnits
        : Number(item.totalPrice ?? 0),
  }))

  const allLines = [...materialLines, ...equipmentLines, ...vehicleLines]
  const totalFromLines = allLines.reduce((sum, row) => sum + row.quantity * row.unitPrice, 0)

  return {
    id: doc.id,
    title: doc.projectName,
    customerName: doc.customerName,
    customerEmail: doc.customerEmail,
    customerAddress: doc.customerAddress,
    deadlineFrom: formatDateForUi(doc.estimateStartDate),
    deadlineTo: formatDateForUi(doc.estimateEndDate),
    location: doc.customerAddress || '—',
    paymentMethod: '—',
    description: doc.description,
    status: doc.isApproved ? 'signed' : 'pending',
    projectStatus: normalizeProjectStatus(doc.projectStatus),
    lineItems: allLines,
    taxPercent: Number(doc.taxNumber ?? 0),
    discount: null,
    signedAt: doc.isApproved ? doc.updatedAt : undefined,
    invoiceRef: undefined,
    rawEstimateStartDate: doc.estimateStartDate,
    rawEstimateEndDate: doc.estimateEndDate,
    grandTotal: doc.totalCost ?? totalFromLines,
  }
}

const estimateApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getEstimates: builder.query<EstimateListResponse, GetEstimatesParams | void>({
      query: (params) => ({
        url: '/estimate',
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
        url: '/estimate',
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
        url: `/estimate/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['Estimate'],
    }),

    deleteEstimate: builder.mutation<unknown, string>({
      query: (id) => ({
        url: `/estimate/${id}`,
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
