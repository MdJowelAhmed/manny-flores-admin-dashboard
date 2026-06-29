import { baseApi } from '../baseApi'
import type {
  EquipmentRequestItem,
  MaterialRequestItem,
  VehicleRequestItem,
} from '@/pages/ResourceRequestsReport/resourceRequestsData'

export interface ResourceRequestPagination {
  total: number
  page: number
  limit: number
  totalPage: number
}

export interface ResourceRequestListResponse<T> {
  success: boolean
  statusCode?: number
  message: string
  pagination: ResourceRequestPagination
  data: T[]
}

export interface RequestMaterialApiDoc {
  id: string
  materialName?: string
  material?: { name?: string }
  quantityNeeded: number
  urgencyLevel: string
  reason: string
  employeeId: string
  status: string
  createdAt: string
}

export interface EquipmentRequestApiDoc {
  id: string
  equipmentName: string
  urgencyLevel: string
  reason: string
  employeeId: string
  status: string
  createdAt: string
}

export interface RequestVehicleApiDoc {
  id: string
  vehicleType: string
  projectName: string
  urgencyLevel: string
  reason: string
  employeeId: string
  status: string
  createdAt: string
}

export interface GetResourceRequestsParams {
  page?: number
  limit?: number
  search?: string
}

export type ResourceRequestStatusUpdate = 'APPROVED' | 'REJECTED'

export interface UpdateResourceRequestStatusPayload {
  id: string
  status: ResourceRequestStatusUpdate
}

export function mapMaterialRequestFromApi(doc: RequestMaterialApiDoc): MaterialRequestItem {
  return {
    id: doc.id,
    materialName: doc.material?.name ?? doc.materialName ?? '',
    material: doc.material,
    quantityNeeded: doc.quantityNeeded,
    urgencyLevel: doc.urgencyLevel,
    reason: doc.reason,
    employeeId: doc.employeeId,
    status: doc.status,
    createdAt: doc.createdAt,
  }
}

export function mapEquipmentRequestFromApi(doc: EquipmentRequestApiDoc): EquipmentRequestItem {
  return {
    id: doc.id,
    equipmentName: doc.equipmentName,
    urgencyLevel: doc.urgencyLevel,
    reason: doc.reason,
    employeeId: doc.employeeId,
    status: doc.status,
    createdAt: doc.createdAt,
  }
}

export function mapVehicleRequestFromApi(doc: RequestVehicleApiDoc): VehicleRequestItem {
  return {
    id: doc.id,
    vehicleType: doc.vehicleType,
    projectName: doc.projectName,
    urgencyLevel: doc.urgencyLevel,
    reason: doc.reason,
    employeeId: doc.employeeId,
    status: doc.status,
    createdAt: doc.createdAt,
  }
}

const resourceRequestApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getRequestedMaterials: builder.query<
      ResourceRequestListResponse<RequestMaterialApiDoc>,
      GetResourceRequestsParams | void
    >({
      query: (params) => ({
        url: '/request-material',
        method: 'GET',
        params: {
          page: params?.page ?? 1,
          limit: params?.limit ?? 10,
          ...(params?.search?.trim() ? { search: params.search.trim() } : {}),
        },
      }),
      providesTags: ['RequestedMaterials'],
    }),
    updateRequestedMaterialStatus: builder.mutation<unknown, UpdateResourceRequestStatusPayload>({
      query: ({ id, status }) => ({
        url: `/request-material/${id}`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: ['RequestedMaterials'],
    }),
    getRequestedEquipments: builder.query<
      ResourceRequestListResponse<EquipmentRequestApiDoc>,
      GetResourceRequestsParams | void
    >({
      query: (params) => ({
        url: '/equipment-request',
        method: 'GET',
        params: {
          page: params?.page ?? 1,
          limit: params?.limit ?? 10,
          ...(params?.search?.trim() ? { search: params.search.trim() } : {}),
        },
      }),
      providesTags: ['RequestedEquipments'],
    }),
    updateRequestedEquipmentStatus: builder.mutation<unknown, UpdateResourceRequestStatusPayload>({
      query: ({ id, status }) => ({
        url: `/equipment-request/${id}`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: ['RequestedEquipments'],
    }),
    getRequestedVehicles: builder.query<
      ResourceRequestListResponse<RequestVehicleApiDoc>,
      GetResourceRequestsParams | void
    >({
      query: (params) => ({
        url: '/request-vehicle',
        method: 'GET',
        params: {
          page: params?.page ?? 1,
          limit: params?.limit ?? 10,
          ...(params?.search?.trim() ? { search: params.search.trim() } : {}),
        },
      }),
      providesTags: ['RequestedVehicles'],
    }),
    updateRequestedVehicleStatus: builder.mutation<unknown, UpdateResourceRequestStatusPayload>({
      query: ({ id, status }) => ({
        url: `/request-vehicle/${id}`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: ['RequestedVehicles'],
    }),
  }),
})

export const {
  useGetRequestedMaterialsQuery,
  useUpdateRequestedMaterialStatusMutation,
  useGetRequestedEquipmentsQuery,
  useUpdateRequestedEquipmentStatusMutation,
  useGetRequestedVehiclesQuery,
  useUpdateRequestedVehicleStatusMutation,
} = resourceRequestApi
