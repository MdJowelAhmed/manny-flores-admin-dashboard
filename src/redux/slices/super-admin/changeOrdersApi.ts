import { baseApi } from "@/redux/baseApi";
import type { ChangeOrder } from "@/pages/ChangeOrders/changeOrdersData";

export interface ChangeOrderPagination {
    total: number;
    page: number;
    limit: number;
    totalPage: number;
}

export interface ChangeOrderListResponse {
    success: boolean;
    statusCode: number;
    message: string;
    pagination: ChangeOrderPagination;
    data: ChangeOrder[];
}

export interface ChangeOrdersQueryParams {
    search?: string;
    page?: number;
    limit?: number;
    status?: string;
}

export interface CompanyChangeOrdersQueryParams {
    search?: string;
    page?: number;
    limit?: number;
    status?: string;
}

const changeOrdersApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getChangeOrders: builder.query<ChangeOrderListResponse, ChangeOrdersQueryParams>({
            query: ({ search, page = 1, limit = 10, status }) => {
                return {
                    url: '/change-orders',
                    method: 'GET',
                    params: {
                        ...(search && search.trim().length > 0 && { search }),
                        ...(status && status !== 'all' && { status: status.toUpperCase() }),
                        page,
                        limit,
                    },
                }
            },
        }),
        createChangeOrder: builder.mutation<any, FormData>({
            query: (data) => {
                return {
                    url: '/change-orders',
                    method: 'POST',
                    body: data
                }
            },
        }),
        getOrderPdfById: builder.query<any, string>({
            query: (id) => {
                return {
                    url: `/change-orders/pdf/${id}`,
                    method: 'GET',
                }
            },
        }),

        getCompanyChangeOrders: builder.query<ChangeOrderListResponse, CompanyChangeOrdersQueryParams>({
            query: ({ search, page = 1, limit = 10, status }) => {
                return {
                    url: '/change-orders/company-project',
                    method: 'GET',
                    params: {
                        ...(search && search.trim().length > 0 && { search }),
                        ...(status && status !== 'all' && { status: status.toUpperCase() }),
                        page,
                        limit,
                    },
                }
            },
        }),
    })
})

export const {
    useGetChangeOrdersQuery,
    useGetCompanyChangeOrdersQuery,
    useCreateChangeOrderMutation,
    useGetOrderPdfByIdQuery,
    useLazyGetOrderPdfByIdQuery,
} = changeOrdersApi
