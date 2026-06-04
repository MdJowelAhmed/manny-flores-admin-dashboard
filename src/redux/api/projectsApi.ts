import { baseApi } from '../baseApi'
import { imageUrl as toImagePath } from '@/components/common/getImageUrl'
import { normalizeProjectStatus } from '@/pages/Estimate/estimateData'
import type {
  AssignedEmployee,
  ScheduledProject,
} from '@/pages/ProjectScheduling/projectSchedulingData'
import { formatDateDisplay, formatTime } from '@/utils/formatters'

export interface ProjectsPagination {
  total: number
  page: number
  limit: number
  totalPage: number
}

export interface ProjectEmployeeApiDoc {
  id: string
  name?: string | null
  email?: string | null
  profile?: string | null
  role?: string | null
  contact?: string | null
  isBanned?: boolean
  isDeleted?: boolean
  verified?: boolean
  isResetPassword?: boolean
  address?: string | null
  city?: string | null
  country?: string | null
  createdAt?: string
}

export interface ProjectEstimateApiDoc {
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
  totalCost: number | null
  userId?: string
  createdAt?: string
  updatedAt?: string
}

export interface ProjectTeamApiDoc {
  id: string
  teamName: string
  startDate: string | null
  endDate: string | null
  createdAt: string
  updatedAt: string
  employees?: ProjectEmployeeApiDoc[]
}

/** Shape of a single record from `GET /estimate-schedules`. Each
 *  schedule embeds the parent estimate (project + customer details),
 *  the `assignEmployee` ID list, the customer's approval signature,
 *  and a `team[]` array used to resolve each `assignEmployee` ID into
 *  a full employee profile. */
export interface ProjectApiDoc {
  id: string
  estimateId: string
  signature?: string | null
  projectStatus: string
  assignEmployee?: string[]
  teamId?: string | null
  assignedEmployees?: ProjectEmployeeApiDoc[]
  projectStartDate: string
  projectEndDate: string
  createdAt: string
  updatedAt: string
  estimate?: ProjectEstimateApiDoc | null
  /** The API may return a single team object, `null`, or (older shape) an
   *  array of teams. The mapper normalizes all of these into an array. */
  team?: ProjectTeamApiDoc | ProjectTeamApiDoc[] | null
  /** @deprecated Older API field — assigned employees now live under `team.employees`. */
  employees?: ProjectEmployeeApiDoc[]
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
  projectStartDate: string
  note: string
}

export interface AssignProjectEmployeePayload {
  employeeId: string
}

export interface CompleteProjectPayload {
  projectStatus: 'COMPLETED' | 'COMPLETED_REQUESTED'
}

export interface EmployeeUserApiDoc {
  id: string
  name: string
  email: string
  createdAt: string
  contact?: string | null
  isBanned?: boolean
  isDeleted?: boolean
  profile?: string | null
  role: string
  verified?: boolean
  isResetPassword?: boolean
  address?: string | null
  city?: string | null
  country?: string | null
}

export interface AllEmployeesResponse {
  success: boolean
  statusCode?: number
  message: string
  pagination?: ProjectsPagination
  data: EmployeeUserApiDoc[]
}

export interface GetAllEmployeesParams {
  page?: number
  limit?: number
}

function formatScheduledDate(iso: string): string {
  if (!iso) return '—'
  const parsed = new Date(iso)
  if (Number.isNaN(parsed.getTime())) return '—'
  return formatDateDisplay(parsed)
}

/** Normalize any uploaded asset (profile pic, signature, etc.) to a
 *  relative `/uploads/...` path. Vite proxies `/uploads` to the API
 *  host in dev so the browser can load it without auth/CORS issues. */
function resolveAssetUrl(raw?: string | null): string | null {
  if (!raw || typeof raw !== 'string' || !raw.trim()) return null
  if (raw.startsWith('data:') || raw.startsWith('blob:')) return raw
  const path = toImagePath(raw)
  return path || null
}

function mapEmployee(entry: ProjectEmployeeApiDoc): AssignedEmployee | null {
  const id = entry?.id ?? ''
  if (!id) return null
  return {
    id,
    name: entry.name?.trim() || '—',
    email: entry.email ?? undefined,
    profileUrl: resolveAssetUrl(entry.profile ?? null),
  }
}

function shortEstimateId(id: string): string {
  if (!id) return ''
  return id.includes('-') ? id.split('-')[0] : id.slice(0, 8)
}

/** Build a single lookup of every employee that appears across any team
 *  payload, so we can resolve `assignEmployee` IDs into full employee
 *  records without making a second request. */
function buildEmployeeIndex(
  teams?: ProjectTeamApiDoc[],
  assignedEmployees?: ProjectEmployeeApiDoc[]
): Map<string, ProjectEmployeeApiDoc> {
  const index = new Map<string, ProjectEmployeeApiDoc>()
  assignedEmployees?.forEach((emp) => {
    if (emp?.id && !index.has(emp.id)) index.set(emp.id, emp)
  })
  if (!Array.isArray(teams)) return index
  teams.forEach((team) =>
    team?.employees?.forEach((emp) => {
      if (emp?.id && !index.has(emp.id)) index.set(emp.id, emp)
    })
  )
  return index
}

/** Pick the team that best represents this schedule's assignment.
 *  Prefers a team whose membership matches the `assignEmployee` set
 *  exactly; otherwise falls back to the most recently updated team
 *  that contains every assigned employee. Returns `null` if none. */
function resolveAssignedTeam(
  teams: ProjectTeamApiDoc[] | undefined,
  assignedIds: string[]
): ProjectTeamApiDoc | null {
  if (!teams?.length || assignedIds.length === 0) return null
  const assignedSet = new Set(assignedIds)

  const matchingTeams = teams.filter((team) => {
    const empIds = team.employees?.map((e) => e.id).filter(Boolean) ?? []
    if (empIds.length === 0) return false
    return [...assignedSet].every((id) => empIds.includes(id))
  })
  if (matchingTeams.length === 0) return null

  const exact = matchingTeams.find((team) => {
    const empIds = new Set(team.employees?.map((e) => e.id).filter(Boolean) ?? [])
    return empIds.size === assignedSet.size
  })
  if (exact) return exact

  return [...matchingTeams].sort((a, b) => {
    const ta = new Date(b.updatedAt).getTime() || 0
    const tb = new Date(a.updatedAt).getTime() || 0
    return ta - tb
  })[0]
}

export function mapProjectFromApi(doc: ProjectApiDoc): ScheduledProject {
  const estimate = doc.estimate ?? null
  const teams: ProjectTeamApiDoc[] = Array.isArray(doc.team)
    ? doc.team
    : doc.team
      ? [doc.team]
      : []
  const assignedIds = doc.assignEmployee?.filter(Boolean) ?? []
  const rootAssigned = doc.assignedEmployees ?? []

  const employeeIndex = buildEmployeeIndex(teams, rootAssigned)
  const fallbackEmployees = doc.employees ?? []

  let assignedEmployees: AssignedEmployee[] = assignedIds
    .map((id) => {
      const indexed = employeeIndex.get(id)
      if (indexed) return mapEmployee(indexed)
      const fromLegacy = fallbackEmployees.find((e) => e?.id === id)
      return fromLegacy ? mapEmployee(fromLegacy) : null
    })
    .filter((e): e is AssignedEmployee => !!e)

  if (assignedEmployees.length === 0 && rootAssigned.length > 0) {
    assignedEmployees = rootAssigned
      .map((emp) => mapEmployee(emp))
      .filter((e): e is AssignedEmployee => !!e)
  }

  if (assignedEmployees.length === 0 && fallbackEmployees.length > 0) {
    assignedEmployees = fallbackEmployees
      .map((emp) => mapEmployee(emp))
      .filter((e): e is AssignedEmployee => !!e)
  }

  const startIso = doc.projectStartDate || doc.createdAt
  const fallbackTitle = doc.estimateId
    ? `Project #${shortEstimateId(doc.estimateId)}`
    : '—'
  const projectName = estimate?.projectName?.trim() || fallbackTitle

  const teamById = doc.teamId
    ? teams.find((team) => team.id === doc.teamId)
    : undefined
  const assignedTeam =
    teamById ?? resolveAssignedTeam(teams, assignedIds) ?? teams[0] ?? null
  const teamLabel = assignedTeam?.teamName?.trim()
    ? assignedTeam.teamName.trim()
    : assignedEmployees.length > 0
      ? String(assignedEmployees.length)
      : ''

  return {
    id: doc.id,
    estimateId: doc.estimateId,
    status: doc.projectStatus,
    projectStatus: normalizeProjectStatus(
      estimate?.projectStatus ?? doc.projectStatus
    ),
    scheduledDate: formatScheduledDate(startIso),
    estimateStartDate: doc.projectStartDate ?? '',
    estimateEndDate: doc.projectEndDate ?? '',
    projectTitle: projectName,
    category: estimate?.description?.trim() ?? '',
    project: projectName,
    uploadDate: formatScheduledDate(doc.createdAt),
    uploadedBy: estimate?.customerName ?? '',
    team: teamLabel,
    customer: estimate?.customerName ?? '',
    email: estimate?.customerEmail ?? '',
    company: estimate?.customerName ?? '',
    serviceLocation: estimate?.customerAddress ?? '',
    description: estimate?.description ?? '',
    eta: startIso ? formatTime(startIso) : '',
    assignedEmployees,
    assignedAvatarUrls: assignedEmployees
      .map((e) => e.profileUrl)
      .filter((url): url is string => !!url),
    assignedEmployeeIds:
      assignedIds.length > 0 ? assignedIds : assignedEmployees.map((e) => e.id),
    customerSignature: resolveAssetUrl(doc.signature),
    signedAt: doc.updatedAt ?? doc.createdAt,
  }
}

const projectsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getScheduledProjects: builder.query<ProjectsListResponse, GetProjectsParams | void>({
      query: (params) => ({
        url: '/estimate-schedules',
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
      { estimateId: string; body: ReScheduleProjectPayload }
    >({
      query: ({ estimateId, body }) => ({
        url: `/estimate-schedules/${estimateId}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['Projects'],
    }),
    completeRequest: builder.mutation<
      { success?: boolean; message?: string },
      { projectId: string; body: CompleteProjectPayload }
    >({
      query: ({ projectId, body }) => ({
        url: `/estimate-schedules/mark-as-completed/${projectId}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['Projects'],
    }),
    getAllEmployees: builder.query<AllEmployeesResponse, GetAllEmployeesParams | void>({
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
  useGetScheduledProjectsQuery,
  useAssignProjectEmployeeMutation,
  useReScheduleProjectMutation,
  useCompleteRequestMutation,
  useGetAllEmployeesQuery,
} = projectsApi
