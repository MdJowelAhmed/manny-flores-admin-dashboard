import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Pagination } from '@/components/common/Pagination'
import { SAMPLE_NOTIFICATIONS } from './notificationData'
import type { Notification } from '@/types/notification'
import { formatDistanceToNow } from 'date-fns'
export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>(SAMPLE_NOTIFICATIONS)
  const [page, setPage] = useState(1)
  const [limit] = useState(10)

  const totalItems = notifications.length
  const totalPages = Math.max(1, Math.ceil(totalItems / limit))

  const paginatedNotifications = useMemo(() => {
    const start = (page - 1) * limit
    return notifications.slice(start, start + limit)
  }, [notifications, page, limit])

  const handleMarkAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    )
  }

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-xl font-semibold text-accent">Notifications</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={handleMarkAllAsRead}
          disabled={unreadCount === 0}
          className="sm:ml-auto"
        >
          Read All
        </Button>
      </div>

      <div className="rounded-lg border bg-card">
        <div className="divide-y">
          {paginatedNotifications.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              No notifications
            </div>
          ) : (
            paginatedNotifications.map((notification) => (
              <NotificationRow
                key={notification.id}
                notification={notification}
                onMarkAsRead={handleMarkAsRead}
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
  notification: Notification
  onMarkAsRead: (id: string) => void
}

function NotificationRow({ notification, onMarkAsRead }: NotificationRowProps) {
  return (
    <div
      className={`flex items-start justify-between gap-4 p-4 transition-colors ${
        notification.isRead ? 'bg-muted/30' : 'bg-background'
      }`}
    >
      <div className="flex-1 min-w-0">
        <p className="font-medium text-accent">{notification.title}</p>
        <p className="text-sm text-muted-foreground mt-0.5">{notification.message}</p>
        <p className="text-xs text-muted-foreground mt-2">
          {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
        </p>
      </div>
      {!notification.isRead && (
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onMarkAsRead(notification.id)}
          className="shrink-0"
        >
          Read
        </Button>
      )}
    </div>
  )
}
