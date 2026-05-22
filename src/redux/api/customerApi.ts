import { baseApi } from '../baseApi'
import { getImageUrl } from '@/utils/getImageUrl'
import { formatDate } from '@/utils/formatters'

export interface CustomerApiDoc {
  id: string
  name: string
  email: string
  createdAt: string
  contact: string | null
  isBanned: boolean
  isDeleted: boolean
  profile: string | null
  role: string
  verified: boolean
  isResetPassword?: boolean
  address: string | null
  city: string | null
  country: string | null
}

export interface CustomerPagination {
  total: number
  page: number
  limit: number
  totalPage: number
}

export interface CustomerListResponse {
  success: boolean
  statusCode?: number
  message: string
  pagination: CustomerPagination
  data: CustomerApiDoc[]
}

export interface GetCustomersParams {
  page?: number
  limit?: number
  search?: string
}

export function formatCustomerAddress(
  doc: Pick<CustomerApiDoc, 'address' | 'city' | 'country'>
): string {
  return [doc.address, doc.city, doc.country].filter((p) => p?.trim()).join(', ')
}

export interface Customer {
  id: string
  name: string
  email: string
  contact: string
  createdAt: string
  profileUrl: string | null
  verified: boolean
  isBanned: boolean
}

export function isCustomerUser(doc: CustomerApiDoc): boolean {
  return doc.role === 'USER' && !doc.isDeleted
}

export function mapCustomerFromApi(doc: CustomerApiDoc): Customer {
  const profile = doc.profile?.trim()
  return {
    id: doc.id,
    name: doc.name,
    email: doc.email,
    contact: doc.contact ?? '—',
    createdAt: formatDate(doc.createdAt, 'dd-MM-yyyy'),
    profileUrl: profile ? getImageUrl(profile) : null,
    verified: doc.verified,
    isBanned: doc.isBanned,
  }
}

const customerApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCustomers: builder.query<CustomerListResponse, GetCustomersParams | void>({
      query: (params) => ({
        url: '/user/admin/all',
        method: 'GET',
        params: {
          page: params?.page ?? 1,
          limit: params?.limit ?? 10,
          ...(params?.search?.trim() ? { search: params.search.trim() } : {}),
        },
      }),
      transformResponse: (response: CustomerListResponse) => ({
        ...response,
        data: response.data.filter(isCustomerUser),
      }),
      providesTags: ['Customers'],
    }),
  }),
})

export const { useGetCustomersQuery } = customerApi
