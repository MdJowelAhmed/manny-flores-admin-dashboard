import { baseApi } from '../baseApi'
import type { Equipment } from '@/types'
import { formatCurrency, formatDateDisplay } from '@/utils/formatters'

export interface EquipmentCategoryRef {
  id: string
  name: string
}

export interface EquipmentApiDoc {
  id: string
  equipmentName: string
  category: string | EquipmentCategoryRef
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
  category: string
  purchaseDate: string
  purchaseCost: number
  warrantyExpiryDate: string
}

function resolveCategoryId(category: EquipmentApiDoc['category']): string {
  if (typeof category === 'string') return category
  return category?.id ?? ''
}

function resolveCategoryName(
  category: EquipmentApiDoc['category'],
  categoryNameById?: Record<string, string>
): string {
  if (typeof category === 'object' && category?.name) return category.name
  const id = resolveCategoryId(category)
  return categoryNameById?.[id] ?? ''
}

function formatApiDate(value: string): string {
  if (!value?.trim()) return '—'
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return value
  return formatDateDisplay(parsed)
}

export function mapEquipmentFromApi(
  doc: EquipmentApiDoc,
  categoryNameById?: Record<string, string>
): Equipment {
  const categoryId = resolveCategoryId(doc.category)
  const categoryName = resolveCategoryName(doc.category, categoryNameById)

  return {
    id: doc.id,
    equipmentName: doc.equipmentName,
    categoryId,
    category: categoryName,
    type: categoryName,
    model: doc.equipmentName,
    assignedTo: '—',
    usage: '—',
    nextService: '—',
    status: 'Available',
    purchaseDate: formatApiDate(doc.purchaseDate),
    purchaseCost: formatCurrency(doc.purchaseCost),
    warrantyExpiry: formatApiDate(doc.warrantyExpiryDate),
    lastService: '—',
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
