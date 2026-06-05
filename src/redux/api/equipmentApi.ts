import { baseApi } from '../baseApi'
import type { EquipmentListItem } from '@/pages/EquipmentMaintenance/equipmentMaintenanceData'

export interface EquipmentCategoryRef {
  id: string
  name: string
}

export interface EquipmentApiDoc {
  id: string
  equipmentName: string
  categoryId: string
  category?: EquipmentCategoryRef
  purchaseDate: string
  purchaseCost: number
  warrantyExpiryDate: string
  isDeleted?: boolean
  userId?: string
  createdAt: string
  updatedAt: string
}

export interface EquipmentPagination {
  total: number
  page: number
  limit: number
  totalPage: number
}

export interface EquipmentListResponse {
  success: boolean
  statusCode?: number
  message: string
  pagination: EquipmentPagination
  data: EquipmentApiDoc[]
}

export interface GetEquipmentParams {
  page?: number
  limit?: number
}

export interface EquipmentPayload {
  equipmentName: string
  categoryId: string
  purchaseDate: string
  purchaseCost: number
  warrantyExpiryDate: string
}

export function mapEquipmentFromApi(
  doc: EquipmentApiDoc,
  categoryNameById?: Record<string, string>
): EquipmentListItem {
  return {
    id: doc.id,
    equipmentName: doc.equipmentName,
    categoryId: doc.categoryId,
    category: doc.category?.name ?? categoryNameById?.[doc.categoryId] ?? '',
    purchaseDate: doc.purchaseDate,
    purchaseCost: doc.purchaseCost,
    warrantyExpiryDate: doc.warrantyExpiryDate,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
    isDeleted: doc.isDeleted,
  }
}

export function toApiDateIso(date: Date): string {
  const d = new Date(date)
  d.setUTCHours(0, 0, 0, 0)
  return d.toISOString()
}

const equipmentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getEquipment: builder.query<EquipmentListResponse, GetEquipmentParams | void>({
      query: (params) => ({
        url: '/equipment',
        method: 'GET',
        params: {
          page: params?.page ?? 1,
          limit: params?.limit ?? 10,
        },
      }),
      providesTags: ['Equipment'],
    }),

    addEquipment: builder.mutation<EquipmentListResponse, EquipmentPayload>({
      query: (body) => ({
        url: '/equipment',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Equipment'],
    }),

    updateEquipment: builder.mutation<
      EquipmentListResponse,
      { id: string } & EquipmentPayload
    >({
      query: ({ id, ...body }) => ({
        url: `/equipment/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['Equipment'],
    }),

    deleteEquipment: builder.mutation<unknown, string>({
      query: (id) => ({
        url: `/equipment/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Equipment'],
    }),
  }),
})

export const {
  useGetEquipmentQuery,
  useAddEquipmentMutation,
  useUpdateEquipmentMutation,
  useDeleteEquipmentMutation,
} = equipmentApi
