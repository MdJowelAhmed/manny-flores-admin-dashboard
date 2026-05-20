import { baseApi } from "@/redux/baseApi";

const documentsApprovalApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getDocumentsApprovals: builder.query<any, { limit?: number, page?: number, search?: string }>({
            query: ({ limit = 10, page = 1, search }) => {
                return {
                    url: `/documents`,
                    method: 'GET',
                    params: {
                        ...(search && search.trim().length > 0 && { search }),
                        page: page,
                        limit: limit
                    }
                }
            },
        }),
        getDocumentsOverview: builder.query<any, void>({
            query: () => {
                return {
                    url: `/documents/overview`,
                    method: 'GET',
                }
            },
        }),
        uploadDocument: builder.mutation<any, FormData>({
            query: (data) => {
                return {
                    url: `/documents`,
                    method: 'POST',
                    body: data
                }
            },
        }),

    })
})

export const { useGetDocumentsApprovalsQuery, useGetDocumentsOverviewQuery, useUploadDocumentMutation } = documentsApprovalApi;