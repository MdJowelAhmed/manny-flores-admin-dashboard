import { useCallback, useMemo, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Pagination } from '@/components/common/Pagination'
import { formatDistanceToNow } from 'date-fns'
import { toast } from '@/utils/toast'
import {
  useGetNotificationsQuery,
  useMarkAllNotificationsReadMutation,
  useMarkNotificationReadMutation,
  mapNotificationFromApi,
  type NotificationItem,
} from '@/redux/api/notificationApi'

export default function Notifications() {
  const [searchParams, setSearchParams] = useSearchParams()
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
  const limit = Math.max(1, parseInt(searchParams.get('limit') || '10', 10))

  const { data, isLoading, isFetching } = useGetNotificationsQuery({ page, limit })
  const [markRead, { isLoading: isMarkingOne }] = useMarkNotificationReadMutation()
  const [markAllRead, { isLoading: isMarkingAll }] = useMarkAllNotificationsReadMutation()

  const notifications = useMemo<NotificationItem[]>(
    () => (data?.data ?? []).map(mapNotificationFromApi),
    [data?.data]
  )

  const lastTotalPagesRef = useRef(1)
  const lastTotalItemsRef = useRef(0)

  if (data?.pagination?.totalPage) {
    lastTotalPagesRef.current = Math.max(1, data.pagination.totalPage)
  }
  if (typeof data?.pagination?.total === 'number') {
    lastTotalItemsRef.current = data.pagination.total
  }

  const totalPages = lastTotalPagesRef.current
  const totalItems = lastTotalItemsRef.current
  const unreadCount = notifications.filter((n) => !n.isRead).length

  const setPage = useCallback(
    (p: number) => {
      const next = new URLSearchParams(searchParams)
      p > 1 ? next.set('page', String(p)) : next.delete('page')
      setSearchParams(next, { replace: true })
    },
    [searchParams, setSearchParams]
  )

  const handleMarkAsRead = async (id: string) => {
    try {
      await markRead(id).unwrap()
    } catch (err) {
      const message =
        (err as { data?: { message?: string } })?.data?.message ?? 'Failed to mark as read'
      toast({ title: 'Error', description: message, variant: 'destructive' })
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await markAllRead().unwrap()
    } catch (err) {
      const message =
        (err as { data?: { message?: string } })?.data?.message ?? 'Failed to mark all as read'
      toast({ title: 'Error', description: message, variant: 'destructive' })
    }
  }

  const showEmpty = !isLoading && !isFetching && notifications.length === 0

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-xl font-semibold text-accent">Notifications</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={handleMarkAllAsRead}
          disabled={unreadCount === 0 || isMarkingAll}
          className="sm:ml-auto"
        >
          Read All
        </Button>
      </div>

      <div className="rounded-lg border bg-card">
        <div className="divide-y">
          {isLoading ? (
            <div className="py-12 text-center text-muted-foreground">Loading...</div>
          ) : showEmpty ? (
            <div className="py-12 text-center text-muted-foreground">No notifications</div>
          ) : (
            notifications.map((notification) => (
              <NotificationRow
                key={notification.id}
                notification={notification}
                onMarkAsRead={handleMarkAsRead}
                disabled={isMarkingOne || isFetching}
              />
            ))
          )}
        </div>

        {totalPages > 1 && (
          <div className="border-t">
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              totalItems={totalItems}
              itemsPerPage={limit}
              onPageChange={setPage}
              showItemsPerPage={false}
            />
          </div>
        )}
      </div>
    </div>
  )
}

interface NotificationRowProps {
  notification: NotificationItem
  onMarkAsRead: (id: string) => void
  disabled?: boolean
}

function NotificationRow({ notification, onMarkAsRead, disabled }: NotificationRowProps) {
  const ts = new Date(notification.timestamp)
  const validDate = !Number.isNaN(ts.getTime())

  return (
    <div
      className={`flex items-start justify-between gap-4 p-4 transition-colors ${notification.isRead ? 'bg-muted/30' : 'bg-white'
        }`}
    >
      <div className="flex-1 min-w-0">
        <p className="font-medium text-accent">{notification.title}</p>
        <p className="text-sm text-muted-foreground mt-0.5">{notification.message}</p>
        <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
          {notification.senderName && (
            <>
              <span className="font-medium">{notification.senderName}</span>
              <span>•</span>
            </>
          )}
          <span>{validDate ? formatDistanceToNow(ts, { addSuffix: true }) : ''}</span>
        </div>
      </div>
      {!notification.isRead && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => onMarkAsRead(notification.id)}
          disabled={disabled}
          className="shrink-0 h-8"
        >
          Read
        </Button>
      )}
    </div>
  )
}
