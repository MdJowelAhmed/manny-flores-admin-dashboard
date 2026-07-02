import {
    createApi,
    fetchBaseQuery,
    type BaseQueryFn,
    type FetchArgs,
    type FetchBaseQueryError,
} from '@reduxjs/toolkit/query/react'
import { API_V1_URL } from '@/config/api'
import type { RootState } from './store'
import {
    getStoredToken,
    handleSessionExpired,
    isAuthPublicEndpoint,
} from './sessionHandler'

const rawBaseQuery = fetchBaseQuery({
    baseUrl: API_V1_URL,
    prepareHeaders: (headers, { getState }) => {
        const stateToken = (getState() as RootState).auth.token
        const token = stateToken ?? getStoredToken()
        if (token) {
            headers.set('authorization', `Bearer ${token}`)
        }
        return headers
    },
})

const baseQueryWithGlobalErrors: BaseQueryFn<
    string | FetchArgs,
    unknown,
    FetchBaseQueryError
> = async (args, api, extraOptions) => {
    const result = await rawBaseQuery(args, api, extraOptions)

    if (result.error?.status === 401) {
        const requestUrl = typeof args === 'string' ? args : args.url
        const hadToken = Boolean(
            (api.getState() as RootState).auth.token ?? getStoredToken()
        )

        if (hadToken && !isAuthPublicEndpoint(requestUrl)) {
            handleSessionExpired(api, () => api.dispatch(baseApi.util.resetApiState()))
        }
    }

    return result
}

export const baseApi = createApi({
    reducerPath: 'baseApi',
    baseQuery: baseQueryWithGlobalErrors,
 tagTypes: [
  'Auth',
  'Category',
  'Chats',
  'Materials',
  'Equipment',
  'Vehicles',
  'Estimate',
  'Invoice',
  'Projects',
  'Teams',
  'Employees',
  'Attendance',
  'PayrollManagement',
  'ResourceRequestsReport',
  'RequestedMaterials',
  'RequestedEquipments',
  'RequestedVehicles',
  'ChangeOrders',
  'VehicleMaintenance',
  'EquipmentMaintenance',
  'Review',
  'Reviews',
  'DailySafetyReports',
  'Customers',
  'Payment',
  'Notification',
  'CompanyProjects',
  'PurchaseOrders',
  'Settings',
],
  
   
    endpoints: () => ({}),
})
