import { baseApi } from "@/redux/baseApi";

const changeOrdersApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getChangeOrders: builder.query<
            any,
            { search?: string; page?: number; limit?: number; projectType?: string }
        >({
            query: ({ search, page = 1, limit = 10, projectType }) => {
                return {
                    url: '/change-orders',
                    method: 'GET',
                    params: {
                        ...(search && search.trim().length > 0 && { search }),
                        ...(projectType && { projectType }),
                        page: page,
                        limit: limit
                    }

                }
            },
        }),
        createChangeOrder: builder.mutation<any, any>({
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
    })
})

export const { useGetChangeOrdersQuery, useCreateChangeOrderMutation, useGetOrderPdfByIdQuery, useLazyGetOrderPdfByIdQuery } = changeOrdersApi