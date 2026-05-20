import { baseApi } from "@/redux/baseApi";

const overviewApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        overviewStats: builder.query<any, void>({
            query: () => {
                return {
                    url: '/dashboard/admin/overview/count',
                    method: 'GET',
                }
            },
        }),
        overviewProjectStatus: builder.query<any, void>({
            query: () => {
                return {
                    url: '/dashboard/admin/overview/project-status',
                    method: 'GET',
                }
            },
        }),
        overviewRevenueExpense: builder.query<any, void>({
            query: () => {
                return {
                    url: '/dashboard/admin/overview/revenue-and-expense',
                    method: 'GET',
                }
            },
        }),
        overviewRecentProjects: builder.query<any, { limit?: number, page?: number, search?: string }>({
            query: ({ limit = 10, page = 1, search }) => {
                return {
                    url: '/dashboard/admin/overview/recent-projects',
                    method: 'GET',
                    params: {
                        ...(search && search.trim().length > 0 && { search }),
                        page: page,
                        limit: limit
                    }
                }
            },
        }),
    }),
})

export const { useOverviewStatsQuery, useOverviewProjectStatusQuery, useOverviewRevenueExpenseQuery, useOverviewRecentProjectsQuery } = overviewApi