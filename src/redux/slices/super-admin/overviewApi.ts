import { baseApi } from "@/redux/baseApi";

export interface OverviewStatsData {
    estimateProjectCountLength: number;
    activeProjectCountLength: number;
    allUsersCount: number;
    totalRevenue: number;
}

export interface OverviewStatsResponse {
    success: boolean;
    statusCode: number;
    message: string;
    data: OverviewStatsData;
}

export interface RevenueExpenseMonth {
    month: string;
    revenue: number;
    project: number;
}

export interface RevenueExpenseResponse {
    success: boolean;
    statusCode: number;
    message: string;
    data: {
        months: RevenueExpenseMonth[];
    };
}

export interface OverviewQueryParams {
    year?: string;
}

const overviewApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        overviewStats: builder.query<OverviewStatsResponse, void>({
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
        overviewRevenueExpense: builder.query<RevenueExpenseResponse, OverviewQueryParams>({
            query: ({ year } = {}) => {
                return {
                    url: '/dashboard/admin/overview/revenue-and-expense',
                    method: 'GET',
                    params: {
                        ...(year && { year }),
                    },
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