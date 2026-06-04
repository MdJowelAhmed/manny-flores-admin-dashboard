import { baseApi } from '../baseApi'
import type { Vehicle } from '@/types'
import { formatCurrency, formatDateDisplay } from '@/utils/formatters'

export interface VehicleCategoryRef {
  id: string
  name: string
}

export interface VehicleAssignedEmployeeApi {
  id: string
  name: string
  email?: string
  profile?: string
}

export interface VehicleApiDoc {
  id: string
  model: string
  year: number
  type: string
  categoryId: string
  purchaseDate: string
  purchaseCost: number
  insuranceExpires: string
  maintenanceLastServiceDate?: string
  maintenanceNextServiceDate?: string
  assignEmployeeId?: string
  assignedEmployee?: VehicleAssignedEmployeeApi
  isDeleted?: boolean
  userId?: string
  createdAt: string
  updatedAt: string
}

export interface VehiclePagination {
  total: number
  page: number
  limit: number
  totalPage: number
}

export interface VehicleListResponse {
  success: boolean
  statusCode?: number
  message: string
  pagination: VehiclePagination
  data: VehicleApiDoc[]
}

export interface GetVehiclesParams {
  page?: number
  limit?: number
}

export interface VehiclePayload {
  model: string
  year: number
  type: string
  categoryId: string
  purchaseDate: string
  purchaseCost: number
  insuranceExpires: string
  assignEmployeeId?: string
  maintenanceLastServiceDate?: string
  maintenanceNextServiceDate?: string
}

function formatApiDate(value?: string): string {
  if (!value?.trim()) return ''
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return value
  return formatDateDisplay(parsed)
}

export function mapVehicleFromApi(
  doc: VehicleApiDoc,
  categoryNameById?: Record<string, string>
): Vehicle {
  const assignedTo = doc.assignedEmployee?.name ?? ''
  const nextService = formatApiDate(doc.maintenanceNextServiceDate)
  const lastService = formatApiDate(doc.maintenanceLastServiceDate)
  const category = categoryNameById?.[doc.categoryId] ?? ''

  return {
    id: doc.id,
    vehicleName: `${doc.model} (${doc.year})`,
    category,
    categoryId: doc.categoryId,
    type: doc.type,
    assignedTo,
    usage: '',
    nextService,
    status: assignedTo ? 'In Use' : 'Available',
    model: doc.model,
    year: String(doc.year),
    purchaseDate: formatApiDate(doc.purchaseDate),
    purchaseCost: formatCurrency(doc.purchaseCost),
    insuranceExpiry: formatApiDate(doc.insuranceExpires),
    assignedEmployee: doc.assignedEmployee
      ? {
          name: doc.assignedEmployee.name,
          project: '',
          startDate: '',
          location: '',
        }
      : undefined,
    lastService,
  }
}

const vehiclesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getVehicles: builder.query<VehicleListResponse, GetVehiclesParams | void>({
      query: (params) => ({
        url: '/vehicles',
        method: 'GET',
        params: {
          page: params?.page ?? 1,
          limit: params?.limit ?? 10,
        },
      }),
      providesTags: ['Vehicles'],
    }),

    addVehicle: builder.mutation<VehicleListResponse, VehiclePayload>({
      query: (body) => ({
        url: '/vehicles',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Vehicles'],
    }),

    updateVehicle: builder.mutation<
      VehicleListResponse,
      { id: string } & VehiclePayload
    >({
      query: ({ id, ...body }) => ({
        url: `/vehicles/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['Vehicles'],
    }),

    deleteVehicle: builder.mutation<unknown, string>({
      query: (id) => ({
        url: `/vehicles/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Vehicles'],
    }),
  }),
})

export const {
  useGetVehiclesQuery,
  useAddVehicleMutation,
  useUpdateVehicleMutation,
  useDeleteVehicleMutation,
} = vehiclesApi
