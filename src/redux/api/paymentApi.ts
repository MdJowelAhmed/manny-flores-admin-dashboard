import { baseApi } from '../baseApi'
import type { PaymentListItem } from '@/pages/Payments/paymentsData'
import { getImageUrl } from '@/utils/getImageUrl'

export interface PaymentEstimateApiDoc {
  id: string
  projectName: string
  projectStatus: string
  customerName: string
  customerEmail: string
  customerAddress: string
  totalDate: number
  description: string
  taxNumber: number
  isApproved: boolean
  totalCost: number
  userId: string
  createdAt: string
  updatedAt: string
}

export interface PaymentUserApiDoc {
  id: string
  name: string
  email: string
  profile?: string
}

export interface PaymentApiDoc {
  id: string
  userId: string
  estimateId: string
  amount: number | null
  receiverId: string | null
  note: string | null
  method: string
  checkImage: string | null
  trxId: string | null
  stripePaymentIntentId: string | null
  stripeCheckoutSessionId: string | null
  status: string
  createdAt: string
  updatedAt: string
  resolverId: string | null
  financeCompanyName?: string | null
  loanId?: string | null
  estimate?: PaymentEstimateApiDoc
  user?: PaymentUserApiDoc
}

export interface PaymentPagination {
  total: number
  page: number
  limit: number
  totalPage: number
}

export interface PaymentListResponse {
  success: boolean
  statusCode?: number
  message: string
  pagination: PaymentPagination
  data: PaymentApiDoc[]
}

export interface GetPaymentsParams {
  page?: number
  limit?: number
  search?: string
}

export type PaymentStatusUpdate = 'completed' | 'rejected'

export interface UpdatePaymentStatusPayload {
  id: string
  status: PaymentStatusUpdate
}

export function mapPaymentFromApi(doc: PaymentApiDoc): PaymentListItem {
  const profile = doc.user?.profile?.trim()
  const checkImage = doc.checkImage?.trim() ?? null

  return {
    id: doc.id,
    userId: doc.userId,
    estimateId: doc.estimateId,
    amount: doc.amount,
    receiverId: doc.receiverId,
    note: doc.note,
    method: doc.method,
    checkImage,
    checkImageUrl: checkImage ? getImageUrl(checkImage) : null,
    trxId: doc.trxId,
    stripePaymentIntentId: doc.stripePaymentIntentId,
    stripeCheckoutSessionId: doc.stripeCheckoutSessionId,
    status: doc.status,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
    resolverId: doc.resolverId,
    financeCompanyName: doc.financeCompanyName ?? null,
    loanId: doc.loanId ?? null,
    projectName: doc.estimate?.projectName ?? '',
    estimateTotalCost: doc.estimate?.totalCost ?? 0,
    customerName: doc.user?.name ?? doc.estimate?.customerName ?? '',
    customerEmail: doc.user?.email ?? doc.estimate?.customerEmail ?? '',
    userProfileUrl: profile ? getImageUrl(profile) : null,
    estimate: doc.estimate ?? null,
    user: doc.user ?? null,
  }
}

const paymentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPayments: builder.query<PaymentListResponse, GetPaymentsParams | void>({
      query: (params) => ({
        url: '/payment',
        method: 'GET',
        params: {
          page: params?.page ?? 1,
          limit: params?.limit ?? 10,
          ...(params?.search?.trim() ? { search: params.search.trim() } : {}),
        },
      }),
      providesTags: ['Payment'],
    }),
    paymentStatusUpdate: builder.mutation<unknown, UpdatePaymentStatusPayload>({
      query: ({ id, status }) => ({
        url: `/payment/${id}`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: ['Payment'],
    }),
  }),
})

export const { useGetPaymentsQuery, usePaymentStatusUpdateMutation } = paymentApi
