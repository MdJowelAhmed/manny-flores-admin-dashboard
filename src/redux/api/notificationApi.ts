import { baseApi } from '../baseApi'

export interface NotificationSenderApiDoc {
  id: string
  name: string
  email: string
}

export interface NotificationApiDoc {
  id: string
  senderId: string
  receiverId: string
  title: string
  description: string
  isRead: boolean
  createdAt: string
  updatedAt: string
  sender?: NotificationSenderApiDoc
}

export interface NotificationPagination {
  total: number
  page: number
  limit: number
  totalPage: number
}

export interface NotificationListResponse {
  success: boolean
  statusCode?: number
  message: string
  pagination: NotificationPagination
  data: NotificationApiDoc[]
}

export interface GetNotificationsParams {
  page?: number
  limit?: number
}

export interface NotificationItem {
  id: string
  title: string
  message: string
  timestamp: string
  isRead: boolean
  senderName?: string
  senderEmail?: string
}

export function mapNotificationFromApi(doc: NotificationApiDoc): NotificationItem {
  return {
    id: doc.id,
    title: doc.title,
    message: doc.description,
    timestamp: doc.createdAt,
    isRead: doc.isRead,
    senderName: doc.sender?.name,
    senderEmail: doc.sender?.email,
  }
}

const notificationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getNotifications: builder.query<NotificationListResponse, GetNotificationsParams | void>({
      query: (params) => ({
        url: '/notification',
        method: 'GET',
        params: {
          page: params?.page ?? 1,
          limit: params?.limit ?? 10,
        },
      }),
      providesTags: ['Notification'],
    }),
    markNotificationRead: builder.mutation<{ success?: boolean; message?: string }, string>({
      query: (id) => ({
        url: `/notification/${id}`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Notification'],
    }),
    markAllNotificationsRead: builder.mutation<{ success?: boolean; message?: string }, void>({
      query: () => ({
        url: '/notification/read-all',
        method: 'PATCH',
      }),
      invalidatesTags: ['Notification'],
    }),
  }),
})

export const {
  useGetNotificationsQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
} = notificationApi
