import { baseApi } from "@/redux/baseApi";


const chatSlice = baseApi.injectEndpoints({
    endpoints: (builder) => ({

        createInitialChat: builder.mutation({
            query: (id) => {
                return {
                    method: "POST",
                    url: `/chat/${id}`,
                }
            },

            invalidatesTags: ["chats"]
        }),

        getChatList: builder.query({
            query: (search) => {
                const params = new URLSearchParams()
                if (search) params.append('search', search)
                return {
                    url: `/chat?${params.toString()}`,
                }
            },
            providesTags: ["chats"]
        }),

        sendMessage: builder.mutation({
            query: (data) => {
                return {
                    method: "POST",
                    url: "/message",
                    body: data,
                }
            },
        }),

        getMessageList: builder.query({
            query: (id) => {
                return {
                    url: `/message/${id}`,

                }
            },
        }),


    })

})

export const { useCreateInitialChatMutation, useGetChatListQuery, useSendMessageMutation, useGetMessageListQuery } = chatSlice