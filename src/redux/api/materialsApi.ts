import { baseApi } from '../baseApi'
import type { Material } from '@/pages/ManageMaterials/manageMaterialsData'

export interface MaterialCategoryRef {
  id: string
  name: string
}

export interface MaterialApiDoc {
  id: string
  name: string
  unitPrice: number
  quantity: number
  stock: number
  categoryId: string
  category?: MaterialCategoryRef
  isDeleted?: boolean
  createdAt: string
  updatedAt: string
}

export interface MaterialsPagination {
  total: number
  page: number
  limit: number
  totalPage: number
}

export interface MaterialsListResponse {
  success: boolean
  statusCode?: number
  message: string
  pagination: MaterialsPagination
  data: MaterialApiDoc[]
}

export interface GetMaterialsParams {
  page?: number
  limit?: number
}

export interface MaterialPayload {
  name: string
  category: string
  unitPrice: number
  quantity: number
  stock: number
}

export function mapMaterialFromApi(doc: MaterialApiDoc): Material {
  return {
    id: doc.id,
    materialName: doc.name,
    category: doc.category?.name ?? '',
    categoryId: doc.categoryId ?? doc.category?.id ?? '',
    unitPrice: doc.unitPrice,
    quantity: doc.quantity,
    stock: doc.stock,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
    isDeleted: doc.isDeleted,
  }
}

const materialsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMaterials: builder.query<MaterialsListResponse, GetMaterialsParams | void>({
      query: (params) => ({
        url: '/materials',
        method: 'GET',
        params: {
          page: params?.page ?? 1,
          limit: params?.limit ?? 10,
        },
      }),
      providesTags: ['Materials'],
    }),

    addMaterial: builder.mutation<MaterialsListResponse, MaterialPayload>({
      query: (body) => ({
        url: '/materials',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Materials'],
    }),

    updateMaterial: builder.mutation<
      MaterialsListResponse,
      { id: string } & MaterialPayload
    >({
      query: ({ id, ...body }) => ({
        url: `/materials/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['Materials'],
    }),

    deleteMaterial: builder.mutation<unknown, string>({
      query: (id) => ({
        url: `/materials/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Materials'],
    }),
  }),
})

export const {
  useGetMaterialsQuery,
  useAddMaterialMutation,
  useUpdateMaterialMutation,
  useDeleteMaterialMutation,
} = materialsApi
