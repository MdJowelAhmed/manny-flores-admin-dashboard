import { baseApi } from '@/redux/baseApi'
import type {
  PurchaseOrder,
  PurchaseOrdersOverview,
} from '@/pages/PurchaseOrders/purchaseOrdersData'

export interface PurchaseOrdersListResponse {
  success?: boolean
  message?: string
  data: PurchaseOrder[]
  pagination?: {
    total: number
    page: number
    limit: number
    totalPage: number
  }
}

export interface PurchaseOrderResponse {
  success?: boolean
  message?: string
  data: PurchaseOrder
}

export interface PurchaseOrdersOverviewResponse {
  success?: boolean
  message?: string
  data: PurchaseOrdersOverview
}

export interface CreatePurchaseOrderPayload {
  builderId: string
  companyProjectId?: string
  description: string
  amount: number
  dueDate?: string | null
  notes?: string
}

export interface UpdatePurchaseOrderStatusPayload {
  id: string
  status: 'PENDING' | 'SENT' | 'PAID'
  paymentMethod?: string
  paymentNote?: string
}

const purchaseOrdersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPurchaseOrders: builder.query<
      PurchaseOrdersListResponse,
      { search?: string; page?: number; limit?: number; status?: string }
    >({
      query: ({ search, page = 1, limit = 10, status }) => ({
        url: '/purchase-orders',
        method: 'GET',
        params: {
          ...(search?.trim() ? { search: search.trim() } : {}),
          ...(status && status !== 'all' ? { status: status.toUpperCase() } : {}),
          page,
          limit,
        },
      }),
      providesTags: ['PurchaseOrders'],
    }),

    getPurchaseOrdersOverview: builder.query<PurchaseOrdersOverviewResponse, void>({
      query: () => ({
        url: '/purchase-orders/overview',
        method: 'GET',
      }),
      providesTags: ['PurchaseOrders'],
    }),

    createPurchaseOrder: builder.mutation<PurchaseOrderResponse, CreatePurchaseOrderPayload>({
      query: (body) => ({
        url: '/purchase-orders',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['PurchaseOrders'],
    }),

    updatePurchaseOrderStatus: builder.mutation<
      PurchaseOrderResponse,
      UpdatePurchaseOrderStatusPayload
    >({
      query: ({ id, ...body }) => ({
        url: `/purchase-orders/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['PurchaseOrders'],
    }),

    getPurchaseOrderPdf: builder.query<{ data?: { downloadUrl?: string }; downloadUrl?: string }, string>({
      query: (id) => ({
        url: `/purchase-orders/pdf/${id}`,
        method: 'GET',
      }),
    }),
  }),
})

export const {
  useGetPurchaseOrdersQuery,
  useGetPurchaseOrdersOverviewQuery,
  useCreatePurchaseOrderMutation,
  useUpdatePurchaseOrderStatusMutation,
  useLazyGetPurchaseOrderPdfQuery,
} = purchaseOrdersApi
