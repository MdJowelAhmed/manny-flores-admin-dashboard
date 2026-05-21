import { baseApi } from "@/redux/baseApi";

const attendanceApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        allAttendance: builder.query<any, { limit?: number; page?: number } | void>({
            query: (params) => {
                return {
                    url: '/attendance/user',
                    method: 'GET',
                    params: params || undefined,
                }
            },
        }),
        attendanceOverview: builder.query<any, void>({
            query: () => {
                return {
                    url: '/attendance/overview',
                    method: 'GET',
                }
            },
        }), 
        singleAttendance: builder.query<any, { id: string }>({
            query: ({ id }) => {
                return { 
                    url: `/attendance/monthly-data/${id}`,
                    method: 'GET', 
                }
            }, 
        }),
    }),
})

export const { useAllAttendanceQuery, useAttendanceOverviewQuery, useSingleAttendanceQuery } = attendanceApi