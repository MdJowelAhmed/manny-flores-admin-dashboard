import { baseApi } from '../baseApi'

export interface CompanyProjectPagination {
  total: number
  page: number
  limit: number
  totalPage: number
}

export type CompanyProjectPaymentMethod = 'ONLINE' | 'CASH' | 'CARD' | 'CHEQUE'
export type CompanyProjectPaymentType = 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'PENDING'
export type CompanyProjectStatus =
  | 'PENDING'
  | 'IN_PROGRESS'
  | 'ACTIVE'
  | 'COMPLETED'
  | 'CANCELLED'
export type CompanyProjectTaskPriority = 'LOW' | 'MEDIUM' | 'HIGH'

export interface CompanyProjectBuilder {
  id: string
  name: string
  email: string
  contact?: string | null
  profile?: string | null
}

export interface CompanyProjectDocument {
  id?: string
  url: string
  name?: string
  documentType?: string
  createdAt?: string
}

export interface CompanyProjectApiDoc {
  id: string
  projectName: string
  builderId?: string
  builder?: CompanyProjectBuilder | null
  customerEmail?: string
  paymentMethod: CompanyProjectPaymentMethod | string
  companyName: string
  paymentType: CompanyProjectPaymentType | string
  projectStatus?: CompanyProjectStatus | string
  amountDue: number
  payAmount?: number
  startDate: string
  endDate: string
  totalBudget: number
  documentation?: string[]
  description?: string | null
  teamIds: string[]
  signatures?: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateCompanyProjectPayload {
  projectName: string
  builderId: string
  paymentMethod: string
  companyName: string
  paymentType: string
  startDate: string | null
  endDate: string | null
  totalBudget: number
  payAmount: number
  amountDue?: number
  description?: string
  documentation?: string[]
}

export type UpdateCompanyProjectPayload = Partial<CreateCompanyProjectPayload>

export function buildCompanyProjectFormData(
  payload: CreateCompanyProjectPayload | Record<string, unknown>,
  files: File[] = [],
  existingDocumentation: string[] = []
): FormData {
  const formData = new FormData()

  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined || value === null) return
    if (key === 'documentation' && Array.isArray(value)) return
    formData.append(key, String(value))
  })

  existingDocumentation.forEach((url) => {
    if (url) formData.append('documentation', url)
  })

  files.forEach((file) => {
    formData.append('documentation', file)
  })

  return formData
}

export function buildCompanyProjectRequestBody(
  payload: CreateCompanyProjectPayload,
  options?: { newFiles?: File[]; existingDocumentation?: string[]; preferJson?: boolean }
): CreateCompanyProjectPayload | FormData {
  const newFiles = options?.newFiles ?? []
  const existingDocumentation = options?.existingDocumentation ?? []

  if (options?.preferJson && newFiles.length === 0) {
    return {
      ...payload,
      ...(existingDocumentation.length > 0 ? { documentation: existingDocumentation } : {}),
    }
  }

  return buildCompanyProjectFormData(payload, newFiles, existingDocumentation)
}

export function normalizeProjectDocumentation(
  documentation?: CompanyProjectDocument[] | string[] | null
): CompanyProjectDocument[] {
  if (!documentation || !Array.isArray(documentation)) return []

  return documentation.map((doc, index) => {
    if (typeof doc === 'string') {
      const fileName = doc.split('/').pop() || `Document ${index + 1}`
      return { id: String(index), url: doc, name: fileName }
    }

    return {
      id: doc.id || String(index),
      url: doc.url,
      name: doc.name || doc.url.split('/').pop() || `Document ${index + 1}`,
      documentType: doc.documentType,
      createdAt: doc.createdAt,
    }
  })
}

/** @deprecated use normalizeProjectDocumentation */
export const normalizeCompanyProjectDocuments = normalizeProjectDocumentation

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

export interface CompanyProjectResponse {
  success: boolean
  statusCode?: number
  message: string
  data: CompanyProjectApiDoc
}

export interface SubmitCompanyProjectDecisionPayload {
  id: string
  projectStatus: 'IN_PROGRESS' | 'CANCELLED'
  signatureFile?: File
}

export function buildCompanyProjectDecisionFormData(
  payload: SubmitCompanyProjectDecisionPayload
): FormData {
  const formData = new FormData()
  formData.append('projectStatus', payload.projectStatus)
  if (payload.signatureFile) {
    formData.append('signatures', payload.signatureFile)
  }
  return formData
}

export function dataUrlToSignatureFile(
  dataUrl: string,
  filename = 'signature.png'
): File {
  const [header, base64] = dataUrl.split(',')
  const mime = header.match(/:(.*?);/)?.[1] ?? 'image/png'
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i)
  }
  return new File([bytes], filename, { type: mime })
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
      CreateCompanyProjectPayload | FormData
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
      { id: string; body: UpdateCompanyProjectPayload | FormData }
    >({
      query: ({ id, body }) => ({
        url: `/company-projects/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['CompanyProjects'],
    }),
    deleteCompanyProject: builder.mutation<
      { success?: boolean; message?: string },
      { id: string }
    >({
      query: ({ id }) => ({
        url: `/company-projects/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['CompanyProjects'],
    }),

    getSinglePublicCompanyProject: builder.query<CompanyProjectResponse, string>({
      query: (id) => ({
        url: `/company-projects/${id}`,
        method: 'GET',
      }),
      providesTags: (_result, _error, id) => [{ type: 'CompanyProjects', id }],
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


    submitCompanyProjectDecision: builder.mutation<
      CompanyProjectResponse,
      SubmitCompanyProjectDecisionPayload
    >({
      query: ({ id, ...payload }) => ({
        url: `/company-projects/update/${id}`,
        method: 'PATCH',
        body: buildCompanyProjectDecisionFormData({ id, ...payload }),
      }),
      invalidatesTags: ['CompanyProjects'],
    }),
  }),
})

export const {
  useCompanyProjectOverviewQuery,
  useGetCompanyProjectsQuery,
  useCreateCompanyProjectMutation,
  useUpdateCompanyProjectMutation,
  useDeleteCompanyProjectMutation,
  useAssignCompanyProjectTeamMutation,
  useGetCompanyProjectTasksQuery,
  useCreateCompanyProjectTaskMutation,
  useGetCompanyProjectEmployeesQuery,
  useUpdateCompanyProjectTaskMutation,
  useGetCompanyProjectTaskQuery,
  useDeleteCompanyProjectTaskMutation,
  useGetSinglePublicCompanyProjectQuery,
  useSubmitCompanyProjectDecisionMutation,
} = companyProjectApi
