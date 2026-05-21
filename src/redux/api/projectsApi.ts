import { baseApi, imageUrl } from '../baseApi'
import { normalizeProjectStatus } from '@/pages/Estimate/estimateData'
import type { ScheduledProject } from '@/pages/ProjectScheduling/projectSchedulingData'
import { formatDateDisplay, formatTime } from '@/utils/formatters'

export interface ProjectsPagination {
  total: number
  page: number
  limit: number
  totalPage: number
}

export interface ProjectEstimateApiDoc {
  id: string
  projectName: string
  customerName: string
  customerEmail: string
  customerAddress: string
  estimateStartDate: string
  estimateEndDate: string
  description: string
  createdAt: string
  updatedAt: string
  userId: string
  taxNumber: number
  isApproved: boolean
  totalCost: number
  projectStatus: string
}

export interface ProjectInvoiceSignatureApiDoc {
  id: string
  estimateId: string
  customerSignature: string
  isProvideSignature: boolean
  createdAt: string
  updatedAt: string
  userId: string
}

export interface ProjectEmployeeApiDoc {
  id: string
  name?: string
  profile?: string | null
  email?: string
}

export interface ProjectApiDoc {
  id: string
  estimateId: string
  invoiceWithSignaturesId: string
  status: string
  clientId: string
  createdAt: string
  updatedAt: string
  estimates: ProjectEstimateApiDoc
  invoiceWithSignatures: ProjectInvoiceSignatureApiDoc
  employees: ProjectEmployeeApiDoc[]
}

export interface ProjectsListResponse {
  success: boolean
  statusCode?: number
  message: string
  pagination: ProjectsPagination
  data: ProjectApiDoc[]
}

export interface GetProjectsParams {
  page?: number
  limit?: number
}

export interface ReScheduleProjectPayload {
  note: string
  estimateStartDate: string
  estimateEndDate: string
}

export interface AssignProjectEmployeePayload {
  employeeId: string
}

export interface CompleteProjectPayload {
  projectStatus: 'COMPLETED'
}

function formatScheduledDate(iso: string): string {
  const parsed = new Date(iso)
  if (Number.isNaN(parsed.getTime())) return '—'
  return formatDateDisplay(parsed)
}

function employeeAvatarUrl(profile?: string | null): string | null {
  if (!profile?.trim()) return null
  if (profile.startsWith('http')) return profile
  const base = imageUrl?.replace(/\/$/, '') ?? ''
  const path = profile.startsWith('/') ? profile : `/${profile}`
  return `${base}${path}`
}

export function mapProjectFromApi(doc: ProjectApiDoc): ScheduledProject {
  const estimate = doc.estimates
  const employees = doc.employees ?? []
  const startIso = estimate?.estimateStartDate ?? doc.createdAt

  return {
    id: doc.id,
    estimateId: doc.estimateId,
    status: doc.status,
    projectStatus: normalizeProjectStatus(estimate?.projectStatus),
    scheduledDate: formatScheduledDate(startIso),
    estimateStartDate: estimate?.estimateStartDate ?? '',
    estimateEndDate: estimate?.estimateEndDate ?? '',
    projectTitle: estimate?.projectName ?? '—',
    category: estimate?.description?.trim() || estimate?.projectStatus || '—',
    project: estimate?.projectName ?? '—',
    uploadDate: formatScheduledDate(doc.createdAt),
    uploadedBy: estimate?.customerName ?? '—',
    team: employees.length > 0 ? String(employees.length) : '',
    customer: estimate?.customerName ?? '—',
    email: estimate?.customerEmail ?? '',
    company: '',
    serviceLocation: estimate?.customerAddress ?? '',
    eta: formatTime(startIso),
    assignedAvatarUrls: employees
      .map((e) => employeeAvatarUrl(e.profile))
      .filter((url): url is string => !!url),
    assignedEmployeeIds: employees.map((e) => e.id),
  }
}

const projectsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getProjects: builder.query<ProjectsListResponse, GetProjectsParams | void>({
      query: (params) => ({
        url: '/project/private',
        method: 'GET',
        params: {
          page: params?.page ?? 1,
          limit: params?.limit ?? 10,
        },
      }),
      providesTags: ['Projects'],
    }),
    assignProjectEmployee: builder.mutation<
      { success?: boolean; message?: string },
      { projectId: string; body: AssignProjectEmployeePayload }
    >({
      query: ({ projectId, body }) => ({
        url: `/project/assign-employee/${projectId}`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Projects'],
    }),
    reScheduleProject: builder.mutation<
      { success?: boolean; message?: string },
      { projectId: string; body: ReScheduleProjectPayload }
    >({
      query: ({ projectId, body }) => ({
        url: `/project/re-schedule/${projectId}`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Projects'],
    }),
    completeProject: builder.mutation<
      { success?: boolean; message?: string },
      { projectId: string; body: CompleteProjectPayload }
    >({
      query: ({ projectId, body }) => ({
        url: `/project/complete/${projectId}`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Projects'],
    }),
  }),
})

export const {
  useGetProjectsQuery,
  useAssignProjectEmployeeMutation,
  useReScheduleProjectMutation,
  useCompleteProjectMutation,
} = projectsApi
