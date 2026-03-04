import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { PushNotification } from '@/types'
import type { PaginationState } from '@/types'
import { DEFAULT_PAGINATION } from '@/utils/constants'

const mockNotifications: PushNotification[] = [
  {
    id: 'n1',
    title: 'Flash Sale 20% off for all Drinks',
    message: 'Get 20% off on all drinks this weekend! Hurry up, limited time offer. Visit your nearest store or order online.',
    type: 'Promotion',
    date: '2026-05-20',
    status: 'Sent',
  },
  {
    id: 'n2',
    title: 'Your order has been shipped',
    message: 'Good news! Your order #12345 has been shipped and is on its way. Track your delivery in the app.',
    type: 'Order Update',
    date: '2026-05-19',
    status: 'Sent',
  },
  {
    id: 'n3',
    title: 'Store Closure Notice',
    message: 'Our downtown store will be closed for maintenance on May 25th. We apologize for any inconvenience.',
    type: 'Announcement',
    date: '2026-05-18',
    status: 'Sent',
  },
  {
    id: 'n4',
    title: 'Don\'t forget your reservation',
    message: 'Reminder: You have a table reserved for 2 at 7 PM today. See you soon!',
    type: 'Reminder',
    date: '2026-05-17',
    status: 'Sent',
  },
  {
    id: 'n5',
    title: 'New Menu Items Available',
    message: 'We\'ve added exciting new items to our menu. Try our seasonal specials today!',
    type: 'Promotion',
    date: '2026-05-16',
    status: 'Sent',
  },
]

interface PushNotificationFilters {
  search: string
  type: string
  status: string
}

interface PushNotificationState {
  list: PushNotification[]
  filteredList: PushNotification[]
  filters: PushNotificationFilters
  pagination: PaginationState
  isLoading: boolean
  error: string | null
}

const initialState: PushNotificationState = {
  list: mockNotifications,
  filteredList: mockNotifications,
  filters: {
    search: '',
    type: 'all',
    status: 'all',
  },
  pagination: {
    ...DEFAULT_PAGINATION,
    total: mockNotifications.length,
    totalPages: Math.ceil(mockNotifications.length / DEFAULT_PAGINATION.limit),
  },
  isLoading: false,
  error: null,
}

function applyFilters(
  list: PushNotification[],
  filters: PushNotificationFilters
): PushNotification[] {
  let filtered = [...list]
  if (filters.search) {
    const q = filters.search.toLowerCase()
    filtered = filtered.filter(
      (n) =>
        n.title.toLowerCase().includes(q) ||
        n.message.toLowerCase().includes(q) ||
        n.type.toLowerCase().includes(q) ||
        n.status.toLowerCase().includes(q)
    )
  }
  if (filters.type && filters.type !== 'all') {
    filtered = filtered.filter((n) => n.type === filters.type)
  }
  if (filters.status && filters.status !== 'all') {
    filtered = filtered.filter((n) => n.status === filters.status)
  }
  return filtered
}

const pushNotificationSlice = createSlice({
  name: 'pushNotifications',
  initialState,
  reducers: {
    addNotification: (state, action: PayloadAction<PushNotification>) => {
      state.list.unshift(action.payload)
      state.filteredList = applyFilters(state.list, state.filters)
      state.pagination.total = state.filteredList.length
      state.pagination.totalPages = Math.ceil(
        state.filteredList.length / state.pagination.limit
      )
    },
    setFilters: (state, action: PayloadAction<Partial<PushNotificationFilters>>) => {
      state.filters = { ...state.filters, ...action.payload }
      state.filteredList = applyFilters(state.list, state.filters)
      state.pagination.total = state.filteredList.length
      state.pagination.totalPages = Math.ceil(
        state.filteredList.length / state.pagination.limit
      )
      state.pagination.page = 1
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.pagination.page = action.payload
    },
    setLimit: (state, action: PayloadAction<number>) => {
      state.pagination.limit = action.payload
      state.pagination.totalPages = Math.ceil(
        state.filteredList.length / action.payload
      )
    },
  },
})

export const { addNotification, setFilters, setPage, setLimit } =
  pushNotificationSlice.actions
export default pushNotificationSlice.reducer
