import { baseApi } from "@/redux/baseApi";

const payrollApi = baseApi.injectEndpoints({
    endpoints: (build) => ({
        getPayrollManagement: build.query<any, { search?: string, page?: number, limit?: number }>({
            query: ({ search = "", page = 1, limit = 10 }) => {
                return {
                    url: `/payroll-management`,
                    params: {
                        search,
                        page,
                        limit,
                    }
                }
            },
        }),
        changePayrollStatus: build.mutation<any, { id: string, status: string }>({
            query: ({ id, status }) => {
                return {
                    url: `/payroll-management/${id}`,
                    method: "PATCH",
                    body: status
                }
            }
        }),
        createPayroll: build.mutation<any, any>({
            query: (data: any) => {
                return {
                    url: `/payroll-management`,
                    method: "POST",
                    body: data
                }
            }
        })
    })
})

export const { useGetPayrollManagementQuery, useChangePayrollStatusMutation, useCreatePayrollMutation } = payrollApi
