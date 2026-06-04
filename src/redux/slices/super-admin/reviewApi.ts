import { baseApi } from "@/redux/baseApi";

const reviewApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        allReviews: builder.query<any, { page: string, limit: string } | void>({
            query: (params) => {
                return {
                    url: '/review',
                    method: 'GET',
                    params: params || undefined,
                }
            },
        }),
        updateReviews: builder.mutation<any, { id: string, body: { reviewStatus: string } }>({
            query: ({ id, body }) => {
                return {
                    url: `/review/${id}`,
                    method: 'PATCH',
                    body,
                }
            },
        }),
        reviewOverview: builder.query<any, void>({
            query: () => {
                return {
                    url: '/review/overview',
                    method: 'GET',
                }
            },
        }),
    }),
})

export const { useAllReviewsQuery, useUpdateReviewsMutation, useReviewOverviewQuery } = reviewApi