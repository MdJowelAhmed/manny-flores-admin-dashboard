import { baseApi } from '../baseApi'
import type {
  VehicleAssignedEmployeeItem,
  VehicleListItem,
} from '@/pages/VehicleMaintenance/vehicleMaintenanceData'

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
  category?: VehicleCategoryRef
  purchaseDate: string
  purchaseCost: number
  insuranceExpires: string
  maintenanceLastServiceDate?: string
  maintenanceNextServiceDate?: string
  assignEmployeeId?: string | null
  assignedEmployee?: VehicleAssignedEmployeeApi | null
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

function mapAssignedEmployee(
  emp?: VehicleAssignedEmployeeApi | null
): VehicleAssignedEmployeeItem | null | undefined {
  if (!emp) return emp ?? undefined
  return {
    id: emp.id,
    name: emp.name,
    email: emp.email,
    profile: emp.profile,
  }
}

export function mapVehicleFromApi(
  doc: VehicleApiDoc,
  categoryNameById?: Record<string, string>
): VehicleListItem {
  return {
    id: doc.id,
    model: doc.model,
    year: doc.year,
    type: doc.type,
    categoryId: doc.categoryId,
    category: doc.category?.name ?? categoryNameById?.[doc.categoryId] ?? '',
    purchaseDate: doc.purchaseDate,
    purchaseCost: doc.purchaseCost,
    insuranceExpires: doc.insuranceExpires,
    maintenanceLastServiceDate: doc.maintenanceLastServiceDate,
    maintenanceNextServiceDate: doc.maintenanceNextServiceDate,
    assignEmployeeId: doc.assignEmployeeId,
    assignedEmployee: mapAssignedEmployee(doc.assignedEmployee),
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
    isDeleted: doc.isDeleted,
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
