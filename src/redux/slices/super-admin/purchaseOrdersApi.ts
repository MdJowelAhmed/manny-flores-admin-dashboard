import { baseApi } from '@/redux/baseApi'
import type {
  PurchaseOrder,
  PurchaseOrdersOverview,
} from '@/pages/PurchaseOrders/purchaseOrdersData'
import {
  createMockPurchaseOrder,
  getMockPurchaseOrdersOverview,
  listMockPurchaseOrders,
  recordMockPurchaseOrderPayment,
  updateMockPurchaseOrderStatus,
} from '@/pages/PurchaseOrders/purchaseOrdersMock'

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

export interface CreatePurchaseOrderProjectSnapshot {
  projectName?: string
  companyName?: string
  totalBudget?: number
  payAmount?: number
  amountDue?: number
}

export interface CreatePurchaseOrderPayload {
  builderId: string
  companyProjectId?: string
  description: string
  amount: number
  dueDate?: string | null
  notes?: string
  projectSnapshot?: CreatePurchaseOrderProjectSnapshot
}

export interface UpdatePurchaseOrderStatusPayload {
  id: string
  status: 'PENDING' | 'SENT' | 'PAID'
  paymentMethod?: string
  paymentNote?: string
}

export interface RecordPurchaseOrderPaymentPayload {
  id: string
  amount: number
  method?: string
  note?: string
}

const purchaseOrdersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPurchaseOrders: builder.query<
      PurchaseOrdersListResponse,
      { search?: string; page?: number; limit?: number; status?: string; builderId?: string }
    >({
      async queryFn(args, _api, _extraOptions, baseQuery) {
        const result = await baseQuery({
          url: '/purchase-orders',
          method: 'GET',
          params: {
            ...(args.search?.trim() ? { search: args.search.trim() } : {}),
            ...(args.status && args.status !== 'all'
              ? { status: args.status.toUpperCase() }
              : {}),
            ...(args.builderId ? { builderId: args.builderId } : {}),
            page: args.page ?? 1,
            limit: args.limit ?? 10,
          },
        })

        if (!result.error && result.data) {
          return { data: result.data as PurchaseOrdersListResponse }
        }

        return { data: listMockPurchaseOrders(args) }
      },
      providesTags: ['PurchaseOrders'],
    }),

    getPurchaseOrdersOverview: builder.query<
      PurchaseOrdersOverviewResponse,
      { builderId?: string } | void
    >({
      async queryFn(args, _api, _extraOptions, baseQuery) {
        const builderId = args && 'builderId' in args ? args.builderId : undefined
        const result = await baseQuery({
          url: '/purchase-orders/overview',
          method: 'GET',
          params: builderId ? { builderId } : undefined,
        })

        if (!result.error && result.data) {
          return { data: result.data as PurchaseOrdersOverviewResponse }
        }

        return { data: getMockPurchaseOrdersOverview(builderId) }
      },
      providesTags: ['PurchaseOrders'],
    }),

    createPurchaseOrder: builder.mutation<PurchaseOrderResponse, CreatePurchaseOrderPayload>({
      async queryFn(body, _api, _extraOptions, baseQuery) {
        const result = await baseQuery({
          url: '/purchase-orders',
          method: 'POST',
          body,
        })

        if (!result.error && result.data) {
          return { data: result.data as PurchaseOrderResponse }
        }

        return { data: createMockPurchaseOrder(body) }
      },
      invalidatesTags: ['PurchaseOrders'],
    }),

    updatePurchaseOrderStatus: builder.mutation<
      PurchaseOrderResponse,
      UpdatePurchaseOrderStatusPayload
    >({
      async queryFn({ id, ...body }, _api, _extraOptions, baseQuery) {
        const result = await baseQuery({
          url: `/purchase-orders/${id}`,
          method: 'PATCH',
          body,
        })

        if (!result.error && result.data) {
          return { data: result.data as PurchaseOrderResponse }
        }

        const mockResult = updateMockPurchaseOrderStatus({ id, ...body })
        if ('error' in mockResult && mockResult.error) {
          return { error: mockResult.error }
        }

        return { data: mockResult as PurchaseOrderResponse }
      },
      invalidatesTags: ['PurchaseOrders'],
    }),

    recordPurchaseOrderPayment: builder.mutation<
      PurchaseOrderResponse,
      RecordPurchaseOrderPaymentPayload
    >({
      async queryFn({ id, ...body }, _api, _extraOptions, baseQuery) {
        const result = await baseQuery({
          url: `/purchase-orders/${id}/payments`,
          method: 'POST',
          body,
        })

        if (!result.error && result.data) {
          return { data: result.data as PurchaseOrderResponse }
        }

        const mockResult = recordMockPurchaseOrderPayment({ id, ...body })
        if ('error' in mockResult && mockResult.error) {
          return { error: mockResult.error }
        }

        return { data: mockResult as PurchaseOrderResponse }
      },
      invalidatesTags: ['PurchaseOrders'],
    }),

    getPurchaseOrderPdf: builder.query<
      { data?: { downloadUrl?: string }; downloadUrl?: string },
      string
    >({
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
  useRecordPurchaseOrderPaymentMutation,
  useLazyGetPurchaseOrderPdfQuery,
} = purchaseOrdersApi
