import { baseApi } from '../baseApi'

export interface CompanyProjectPagination {
  total: number
  page: number
  limit: number
  totalPage: number
}

export type CompanyProjectPaymentMethod = 'ONLINE' | 'CASH' | 'CARD' | 'CHEQUE'
export type CompanyProjectPaymentType = 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'PENDING'
export type CompanyProjectTaskPriority = 'LOW' | 'MEDIUM' | 'HIGH'

export interface CompanyProjectApiDoc {
  id: string
  projectName: string
  customerName: string
  customerEmail: string
  paymentMethod: CompanyProjectPaymentMethod | string
  companyName: string
  paymentType: CompanyProjectPaymentType | string
  amountDue: number
  startDate: string
  endDate: string
  totalBudget: number
  description: string | null
  teamIds: string[]
  createdAt: string
  updatedAt: string
}

export interface CreateCompanyProjectPayload {
  projectName: string
  paymentMethod: string
  companyName: string
  paymentType: string
  amountDue: number
  startDate: string | null
  endDate: string | null
  totalBudget: number
  customerName: string
  customerEmail: string
  description?: string
}

export type UpdateCompanyProjectPayload = Partial<CreateCompanyProjectPayload>

export interface CompanyProjectsListResponse {
  success: boolean
  statusCode?: number
  message: string
  pagination: CompanyProjectPagination
  data: CompanyProjectApiDoc[]
}

export interface CompanyProjectOverviewResponse {
  success: boolean
  statusCode?: number
  message: string
  data: {
    totalProjects: number
    activeProjects: number
    completedProjects: number
    cancelledProjects: number
  }
}

export interface GetCompanyProjectsParams {
  page?: number
  limit?: number
  status?: string
  search?: string
}

export interface AssignCompanyProjectTeamPayload {
  teamIds: string[]
}

export interface CompanyProjectTaskEmployee {
  id: string
  name: string
  profile?: string | null
}

export interface CreateCompanyProjectTaskPayload {
  companyProjectId: string
  taskName: string
  employeeIds: string[]
  priority: CompanyProjectTaskPriority | string
  deadline: string
  description: string
}

export interface UpdateCompanyProjectTaskPayload {
  taskName: string
  employeeIds: string[]
  priority: CompanyProjectTaskPriority | string
  deadline: string
  description: string
}

export interface CompanyProjectTaskApiDoc {
  id: string
  companyProjectId: string
  taskName: string
  employeeIds: string[]
  priority: string
  deadline: string
  description: string
  createdAt?: string
  updatedAt?: string
  employees?: CompanyProjectTaskEmployee[]
}

export interface CompanyProjectTasksResponse {
  success: boolean
  statusCode?: number
  message: string
  pagination: CompanyProjectPagination
  data: CompanyProjectTaskApiDoc[]
}

export interface CompanyProjectTaskResponse {
  success: boolean
  statusCode?: number
  message: string
  data: CompanyProjectTaskApiDoc
}

export interface GetCompanyProjectTasksParams {
  companyProjectId: string
  page?: number
  limit?: number
}

export interface CompanyProjectEmployeesResponse {
  success: boolean
  statusCode?: number
  message: string
  pagination?: CompanyProjectPagination
  data: {
    id: string
    name: string
    email: string
    role?: string
    contact?: string | null
    profile?: string | null
    createdAt?: string
    isBanned?: boolean
  }[]
}

const companyProjectApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    companyProjectOverview: builder.query<CompanyProjectOverviewResponse, void>({
      query: () => ({
        url: '/company-projects/overview',
        method: 'GET',
      }),
      providesTags: ['CompanyProjects'],
    }),

    getCompanyProjects: builder.query<
      CompanyProjectsListResponse,
      GetCompanyProjectsParams | void
    >({
      query: (params) => ({
        url: '/company-projects',
        method: 'GET',
        params: {
          page: params?.page ?? 1,
          limit: params?.limit ?? 10,
          status: params?.status ?? '',
          search: params?.search ?? '',
        },
      }),
      providesTags: ['CompanyProjects'],
    }),

    createCompanyProject: builder.mutation<
      { success?: boolean; message?: string; data?: CompanyProjectApiDoc },
      CreateCompanyProjectPayload
    >({
      query: (body) => ({
        url: '/company-projects',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['CompanyProjects'],
    }),

    updateCompanyProject: builder.mutation<
      { success?: boolean; message?: string; data?: CompanyProjectApiDoc },
      { id: string; body: UpdateCompanyProjectPayload }
    >({
      query: ({ id, body }) => ({
        url: `/company-projects/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['CompanyProjects'],
    }),

    assignCompanyProjectTeam: builder.mutation<
      { success?: boolean; message?: string },
      { projectId: string; body: AssignCompanyProjectTeamPayload }
    >({
      query: ({ projectId, body }) => ({
        url: `/company-projects/assign-team/${projectId}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['CompanyProjects'],
    }),

    getCompanyProjectTasks: builder.query<
      CompanyProjectTasksResponse,
      GetCompanyProjectTasksParams
    >({
      query: ({ companyProjectId, page = 1, limit = 10 }) => ({
        url: `/company-project-task/${companyProjectId}`,
        method: 'GET',
        params: {  page, limit },
      }),
      providesTags: ['CompanyProjects'],
    }),

    createCompanyProjectTask: builder.mutation<
      { success?: boolean; message?: string; data?: CompanyProjectTaskApiDoc },
      CreateCompanyProjectTaskPayload
    >({
      query: (body) => ({
        url: '/company-project-task',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['CompanyProjects'],
    }),

    updateCompanyProjectTask: builder.mutation<
      { success?: boolean; message?: string; data?: CompanyProjectTaskApiDoc },
      { taskId: string; body: UpdateCompanyProjectTaskPayload }
    >({
      query: ({ taskId, body }) => ({
        url: `/company-project-task/${taskId}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['CompanyProjects'],
    }), 
    getCompanyProjectTask: builder.query<
      CompanyProjectTaskResponse,
      { taskId: string }
    >({
      query: ({ taskId }) => ({
        url: `/company-project-task/${taskId}`,
        method: 'GET',
      }),
      providesTags: ['CompanyProjects'],
    }),
    deleteCompanyProjectTask: builder.mutation<
      { success?: boolean; message?: string },
      { taskId: string }
    >({
      query: ({ taskId }) => ({
        url: `/company-project-task/${taskId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['CompanyProjects'],
    }), 

    getCompanyProjectEmployees: builder.query<
      CompanyProjectEmployeesResponse,
      { page?: number; limit?: number } | void
    >({
      query: (params) => ({
        url: '/admin/users/employees',
        method: 'GET',
        params: {
          page: params?.page ?? 1,
          limit: params?.limit ?? 100,
        },
      }),
      providesTags: ['Employees'],
    }),
 
  }),
})

export const {
  useCompanyProjectOverviewQuery,
  useGetCompanyProjectsQuery,
  useCreateCompanyProjectMutation,
  useUpdateCompanyProjectMutation,
  useAssignCompanyProjectTeamMutation,
  useGetCompanyProjectTasksQuery,
  useCreateCompanyProjectTaskMutation,
  useGetCompanyProjectEmployeesQuery,
  useUpdateCompanyProjectTaskMutation,
  useGetCompanyProjectTaskQuery,
  useDeleteCompanyProjectTaskMutation,
} = companyProjectApi
