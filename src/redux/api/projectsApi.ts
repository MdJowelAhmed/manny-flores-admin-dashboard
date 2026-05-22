import { baseApi, imageUrl } from '../baseApi'
import { normalizeProjectStatus } from '@/pages/Estimate/estimateData'
import type {
  AssignedEmployee,
  ScheduledProject,
} from '@/pages/ProjectScheduling/projectSchedulingData'
import { formatDateDisplay, formatTime } from '@/utils/formatters'
import { getImageUrl } from '@/utils/getImageUrl'

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

export interface ProjectEmployeeUserApiDoc {
  id: string
  name?: string
  email?: string
  profile?: string | null
}

export interface ProjectEmployeeApiDoc {
  id?: string
  name?: string
  profile?: string | null
  email?: string
  user?: ProjectEmployeeUserApiDoc
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

function resolveProfileUrl(profile?: string | null): string | null {
  if (!profile?.trim()) return null
  return getImageUrl(profile)
}

function resolveAssetUrl(raw?: string | null): string | null {
  if (!raw?.trim()) return null
  if (raw.startsWith('http') || raw.startsWith('data:') || raw.startsWith('blob:')) {
    return raw
  }
  const base = (imageUrl ?? '').replace(/\/$/, '')
  const path = raw.startsWith('/') ? raw : `/${raw}`
  return `${base}${path}`
}

function mapEmployee(entry: ProjectEmployeeApiDoc): AssignedEmployee | null {
  const user = entry.user ?? entry
  const id = user?.id ?? ''
  if (!id) return null
  return {
    id,
    name: user?.name?.trim() || '—',
    email: user?.email ?? undefined,
    profileUrl: resolveProfileUrl(user?.profile ?? null),
  }
}

export function mapProjectFromApi(doc: ProjectApiDoc): ScheduledProject {
  const estimate = doc.estimates
  const rawEmployees = doc.employees ?? []
  const assignedEmployees = rawEmployees
    .map(mapEmployee)
    .filter((e): e is AssignedEmployee => !!e)
  const startIso = estimate?.estimateStartDate ?? doc.createdAt
  const signature = doc.invoiceWithSignatures?.customerSignature ?? null
  const signedAt =
    doc.invoiceWithSignatures?.updatedAt ?? doc.invoiceWithSignatures?.createdAt

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
    team: assignedEmployees.length > 0 ? String(assignedEmployees.length) : '',
    customer: estimate?.customerName ?? '—',
    email: estimate?.customerEmail ?? '',
    company: '',
    serviceLocation: estimate?.customerAddress ?? '',
    description: estimate?.description ?? '',
    eta: formatTime(startIso),
    assignedEmployees,
    assignedAvatarUrls: assignedEmployees
      .map((e) => e.profileUrl)
      .filter((url): url is string => !!url),
    assignedEmployeeIds: assignedEmployees.map((e) => e.id),
    customerSignature: resolveAssetUrl(signature),
    signedAt: signedAt ?? undefined,
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
