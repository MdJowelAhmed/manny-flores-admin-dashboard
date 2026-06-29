import { baseApi } from '../baseApi'

export type RuleType = 'PRIVACY' | 'TERMS' | 'ABOUT'

export interface RuleDoc {
  id: string
  content: string
  type: RuleType
  createdAt: string
  updatedAt: string
}

export interface RuleResponse {
  success: boolean
  statusCode?: number
  message: string
  data: RuleDoc
}

export interface UpdateRulePayload {
  content: string
  type: RuleType
}

const settingsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSettings: builder.query<RuleResponse, RuleType>({
      query: (type) => ({
        url: '/admin/rule',
        method: 'GET',
        params: { type },
      }),
      providesTags: (_result, _error, type) => [{ type: 'Settings', id: type }],
    }),

    updateSettings: builder.mutation<RuleResponse, UpdateRulePayload>({
      query: (body) => ({
        url: '/admin/rule',
        method: 'POST',
        body,
      }),
      invalidatesTags: (_result, _error, { type }) => [{ type: 'Settings', id: type }],
    }),
  }),
})

export const { useGetSettingsQuery, useUpdateSettingsMutation } = settingsApi
