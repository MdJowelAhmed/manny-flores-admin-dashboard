import { baseApi } from "@/redux/baseApi";

const employeeManageApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        allEmployeeManage: builder.query<any, { limit?: number; page?: number, name?: string, search?: string } | void>({
            query: (params) => {
                return {
                    url: '/admin/users',
                    method: 'GET',
                    params: params || undefined,
                }
            },
        }),
        employeeManageOverview: builder.query<any, void>({
            query: () => {
                return {
                    url: '/admin/users/employee-statistics',
                    method: 'GET',
                }
            },
        }),
        singleEmployeeManage: builder.query<any, { id: string }>({
            query: ({ id }) => {
                return {
                    url: `/admin/users/${id}`,
                    method: 'GET',
                }
            },
        }),

        addEmployeeManage: builder.mutation<any, { name: string; email: string; password: string; confirmPassword: string; contact: string; role: string }>({
            query: (data) => {
                return {
                    url: '/admin/users',
                    method: 'POST',
                    body: data,
                }
            },
        }),

        updateEmployeeManage: builder.mutation<any, { id: string; data: { name?: string; email?: string; password?: string; confirmPassword?: string; contact?: string; role?: string; isBanned?: boolean } }>({
            query: ({ id, data }) => {
                return {
                    url: `/admin/users/${id}`,
                    method: 'PATCH',
                    body: data,
                }
            },
        }),

        deleteEmployeeManage: builder.mutation<any, string>({
            query: (id) => {
                return {
                    url: `/admin/users/${id}`,
                    method: 'DELETE',
                }
            },
        }),

        getBuilders: builder.query<any, { limit?: number, page?: number, search?: string }>({
            query: ({ limit = 10, page = 1, search }) => {
                return {
                    url: '/builder',
                    method: 'GET',
                    params: {
                        limit,
                        page,
                        search,
                    },
                }
            },
        }),
    }),
})

export const { useAllEmployeeManageQuery, useEmployeeManageOverviewQuery, useSingleEmployeeManageQuery, useAddEmployeeManageMutation, useUpdateEmployeeManageMutation, useDeleteEmployeeManageMutation, useGetBuildersQuery } = employeeManageApi