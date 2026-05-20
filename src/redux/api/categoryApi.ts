import { baseApi } from '../baseApi'
import type { MaterialCategory } from '@/types'

export type CategoryType = 'MATERIAL' | 'VEHICLE' | 'EQUIPMENT'

export interface CategoryApiDoc {
  id: string
  _id?: string
  name: string
  type: CategoryType
  createdAt: string
  updatedAt: string
  isDeleted?: boolean
}

export interface CategoryListResponse {
  success: boolean
  message: string
  statusCode?: number
  data: CategoryApiDoc[]
}

export interface GetCategoriesParams {
  type: CategoryType
}

export interface CategoryPayload {
  name: string
  type: CategoryType
}

export function mapCategoryFromApi(doc: CategoryApiDoc): MaterialCategory {
  return {
    id: doc.id ?? doc._id ?? '',
    name: doc.name,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  }
}

const categoryApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCategories: builder.query<CategoryListResponse, GetCategoriesParams>({
      query: ({ type }) => ({
        url: '/category',
        method: 'GET',
        params: { type },
      }),
      providesTags: ['Category'],
    }),

    addCategory: builder.mutation<CategoryListResponse, CategoryPayload>({
      query: (body) => ({
        url: '/category',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Category'],
    }),

    updateCategory: builder.mutation<
      CategoryListResponse,
      { id: string } & CategoryPayload
    >({
      query: ({ id, ...body }) => ({
        url: `/category/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['Category'],
    }),

    deleteCategory: builder.mutation<unknown, string>({
      query: (id) => ({
        url: `/category/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Category'],
    }),
  }),
})

export const {
  useGetCategoriesQuery,
  useAddCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} = categoryApi
