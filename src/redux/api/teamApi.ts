import { baseApi } from '../baseApi'

export interface TeamEmployee {
  id: string
  name: string
  email: string
  role: string
  profile?: string | null
}

export interface TeamApiDoc {
  id: string
  teamName: string
  startDate: string | null
  endDate: string | null
  createdAt: string
  updatedAt: string
  employees: TeamEmployee[]
}

export interface TeamsListResponse {
  success: boolean
  statusCode?: number
  message: string
  data: TeamApiDoc[]
}

export interface TeamMutationResponse {
  success: boolean
  statusCode?: number
  message: string
  data: TeamApiDoc
}

export interface CreateTeamPayload {
  teamName: string
  employeeId: string[]
}

export interface UpdateTeamPayload extends Partial<CreateTeamPayload> {
  startDate?: string | null
  endDate?: string | null
}

export interface GetTeamsParams {
  page?: number
  limit?: number
}

const teamApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getTeams: builder.query<TeamsListResponse, GetTeamsParams | void>({
      query: (params) => ({
        url: '/team-management',
        method: 'GET',
        params: {
          page: params?.page ?? 1,
          limit: params?.limit ?? 100,
        },
      }),
      providesTags: ['Teams'],
    }),

    addTeam: builder.mutation<TeamMutationResponse, CreateTeamPayload>({
      query: (body) => ({
        url: '/team-management',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Teams'],
    }),

    updateTeam: builder.mutation<
      TeamMutationResponse,
      { id: string } & UpdateTeamPayload
    >({
      query: ({ id, ...body }) => ({
        url: `/team-management/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['Teams'],
    }),

    deleteTeam: builder.mutation<unknown, string>({
      query: (id) => ({
        url: `/team-management/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Teams'],
    }),
  }),
})

export const {
  useGetTeamsQuery,
  useAddTeamMutation,
  useUpdateTeamMutation,
  useDeleteTeamMutation,
} = teamApi
