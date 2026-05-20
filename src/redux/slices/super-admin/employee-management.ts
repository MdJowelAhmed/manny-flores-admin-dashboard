import { baseApi } from "@/redux/baseApi";

const employeeManageApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        allEmployeeManage: builder.query<any, { limit?: number; page?: number,name?: string,search?: string } | void>({
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
    }),
})

export const { useAllEmployeeManageQuery, useEmployeeManageOverviewQuery, useSingleEmployeeManageQuery, useAddEmployeeManageMutation } = employeeManageApi