import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { RootState } from './store'

export const baseApi = createApi({
    reducerPath: 'baseApi',
    baseQuery: fetchBaseQuery({
        baseUrl: import.meta.env.VITE_API_BASE_URL + '/api/v1',
        prepareHeaders: (headers, { getState }) => {
            const stateToken = (getState() as RootState).auth.token
            const token =
                stateToken ??
                (typeof localStorage !== 'undefined'
                    ? localStorage.getItem('token')
                    : null)
            if (token) {
                headers.set('authorization', `Bearer ${token}`)
            }
            // Don't set Content-Type for FormData - browser will set it with boundary
            // RTK Query will handle this automatically
            return headers
        },
    }),
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
],
  
   
    endpoints: () => ({}),
})

export const imageUrl = import.meta.env.VITE_API_BASE_URL
export const socketUrl = import.meta.env.VITE_API_BASE_URL 
