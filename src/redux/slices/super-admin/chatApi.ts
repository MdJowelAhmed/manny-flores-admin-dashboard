import { baseApi } from '@/redux/baseApi'



export interface CreateGroupChatPayload {

    participants: string[]

    estimateId: string

    groupName: string

}



export interface ChatParticipantUser {
    id: string
    name: string
    email: string
    profile: string | null
}



export interface ChatParticipant {
    id: string
    chatId: string
    userId: string
    createdAt: string
    user: ChatParticipantUser
}



export interface GroupChatData {
    id: string
    status: boolean
    mode: string
    groupName: string
    createdAt: string
    updatedAt: string
    participants: ChatParticipant[]
}



export interface CreateGroupChatResponse {

    success: boolean

    statusCode?: number

    message: string

    data: GroupChatData

}



const chatSlice = baseApi.injectEndpoints({

    endpoints: (builder) => ({

        createInitialChat: builder.mutation({

            query: (id) => ({

                method: 'POST',

                url: `/chat/${id}`,

            }),

            invalidatesTags: ['Chats'],

        }),



        createGroupChat: builder.mutation<CreateGroupChatResponse, CreateGroupChatPayload>({

            query: (body) => ({

                method: 'POST',

                url: '/chat/group',

                body,

            }),

            invalidatesTags: ['Chats'],

        }),



        getChatList: builder.query({

            query: (search) => {

                const params = new URLSearchParams()

                if (search) params.append('search', search)

                return {

                    url: `/chat?${params.toString()}`,

                }

            },

            providesTags: ['Chats'],

        }),



        sendMessage: builder.mutation({

            query: (data) => ({

                method: 'POST',

                url: '/message',

                body: data,

            }),

            invalidatesTags: (_result, _error, arg) => {
                const chatId =
                    arg instanceof FormData ? arg.get('chatId')?.toString() : undefined
                return chatId ? [{ type: 'Chats', id: `messages-${chatId}` }] : ['Chats']
            },

        }),



        getMessageList: builder.query({

            query: (id) => ({

                url: `/message/${id}`,

            }),

            providesTags: (_result, _error, id) => [{ type: 'Chats', id: `messages-${id}` }],

        }),

    }),

})



export const {

    useCreateInitialChatMutation,

    useCreateGroupChatMutation,

    useGetChatListQuery,

    useSendMessageMutation,

    useGetMessageListQuery,

} = chatSlice


