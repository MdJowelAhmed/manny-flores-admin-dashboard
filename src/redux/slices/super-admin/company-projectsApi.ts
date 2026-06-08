export {
  useCompanyProjectOverviewQuery as useCompanyProjectsOverviewQuery,
  useGetCompanyProjectsQuery,
  useCreateCompanyProjectMutation as useCreateCompanyProjectsMutation,
  useUpdateCompanyProjectMutation as useUpdateCompanyProjectsMutation,
  useAssignCompanyProjectTeamMutation,
  useGetCompanyProjectTasksQuery,
  useCreateCompanyProjectTaskMutation,
  useUpdateCompanyProjectTaskMutation,
  useGetCompanyProjectTaskQuery,
  useDeleteCompanyProjectTaskMutation,
  useGetCompanyProjectEmployeesQuery,
} from '@/redux/api/companyProjectApi'

export type {
  CompanyProjectApiDoc,
  CompanyProjectsListResponse,
  CompanyProjectOverviewResponse,
  CreateCompanyProjectPayload,
  UpdateCompanyProjectPayload,
  AssignCompanyProjectTeamPayload,
  CreateCompanyProjectTaskPayload,
  UpdateCompanyProjectTaskPayload,
  CompanyProjectTaskApiDoc,
  CompanyProjectTasksResponse,
  CompanyProjectTaskResponse,
} from '@/redux/api/companyProjectApi'
