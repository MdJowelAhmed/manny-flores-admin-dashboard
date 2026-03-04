import { motion } from 'framer-motion'
import { formatDate } from '@/utils/formatters'
import { sliceMessageByWords } from '@/utils/textUtils'
import { cn } from '@/utils/cn'
import type { PushNotification } from '@/types'

interface NotificationTableProps {
  notifications: PushNotification[]
}

const typeBadgeClasses: Record<string, string> = {
  Promotion: 'bg-amber-100 text-amber-800 border-amber-200',
  'Order Update': 'bg-blue-100 text-blue-800 border-blue-200',
  Announcement: 'bg-purple-100 text-purple-800 border-purple-200',
  Reminder: 'bg-green-100 text-green-800 border-green-200',
}

export function NotificationTable({ notifications }: NotificationTableProps) {
  return (
    <div className="w-full overflow-auto">
      <table className="w-full min-w-[700px]">
        <thead>
          <tr className="bg-amber-100/80 text-slate-800">
            <th className="px-6 py-4 text-left text-sm font-bold">Title</th>
            <th className="px-6 py-4 text-left text-sm font-bold">Message</th>
            <th className="px-6 py-4 text-left text-sm font-bold">Type</th>
            <th className="px-6 py-4 text-left text-sm font-bold">Date</th>
            <th className="px-6 py-4 text-left text-sm font-bold">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {notifications.length === 0 ? (
            <tr>
              <td
                colSpan={5}
                className="px-6 py-8 text-center text-muted-foreground"
              >
                No notifications found. Try adjusting your filters.
              </td>
            </tr>
          ) : (
            notifications.map((notif, index) => (
              <motion.tr
                key={notif.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.03 * index }}
                className="hover:bg-gray-50 transition-colors"
              >
                <td className="px-6 py-4">
                  <span className="text-sm font-semibold text-slate-800">
                    {notif.title}
                  </span>
                </td>
                <td className="px-6 py-4 max-w-xs">
                  <span className="text-sm text-slate-700 line-clamp-2">
                    {sliceMessageByWords(notif.message)}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={cn(
                      'inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border',
                      typeBadgeClasses[notif.type] ??
                        'bg-gray-100 text-gray-800 border-gray-200'
                    )}
                  >
                    {notif.type}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-slate-700">
                    {formatDate(notif.date, 'dd-MM-yyyy')}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {notif.status}
                  </span>
                </td>
              </motion.tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
