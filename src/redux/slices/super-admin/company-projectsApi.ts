import { baseApi } from "@/redux/baseApi";

const conmpanyProjectsApi = baseApi.injectEndpoints({
    endpoints: (build) => ({
        companyProjectsOverview: build.query<any, void>({
            query: () => {
                return {
                    url: `/company-projects/overview`
                }
            },

        }),
        getCompanyProjects: build.query<any, { status: string, page?: number, limit?: number, search?: string }>({
            query: ({ status, page = 1, limit = 10, search = "" }) => {
                return {
                    url: `/company-projects?status=${status}&page=${page}&limit=${limit}&search=${search}`
                }
            },
        }),
        createCompanyProjects: build.mutation<any, any>({
            query: (data: any) => {
                return {
                    url: `/company-projects`,
                    method: "POST",
                    body: data,
                }
            },
        }),

    }),
});

export const { useCompanyProjectsOverviewQuery, useGetCompanyProjectsQuery, useCreateCompanyProjectsMutation } = conmpanyProjectsApi;