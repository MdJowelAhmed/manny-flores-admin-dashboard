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
        updateDocument: builder.mutation<any, { id: string, data: any }>({
            query: ({ id, data }) => {
                return {
                    url: `/documents/${id}`,
                    method: 'PATCH',
                    body: data
                }
            },
        }),
        deleteDocument: builder.mutation<any, string>({
            query: (id) => {
                return {
                    url: `/documents/${id}`,
                    method: 'DELETE',
                }
            },
        }),

    })
})

export const { useGetDocumentsApprovalsQuery, useGetDocumentsOverviewQuery, useUploadDocumentMutation, useUpdateDocumentMutation, useDeleteDocumentMutation } = documentsApprovalApi;