import { motion } from 'framer-motion'
import { Lock } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { formatDate, getInitials } from '@/utils/formatters'
import type { Subscriber } from '@/types'

interface SubscriberTableProps {
  subscribers: Subscriber[]
  onLock?: (subscriber: Subscriber) => void
}

export function SubscriberTable({
  subscribers,
  onLock,
}: SubscriberTableProps) {
  return (
    <div className="w-full overflow-auto">
      <table className="w-full min-w-[700px]">
        <thead>
          <tr className="bg-amber-100/80 text-slate-800">
            <th className="px-6 py-4 text-left text-sm font-bold">
              User Name
            </th>
            <th className="px-6 py-4 text-left text-sm font-bold">Email</th>
            <th className="px-6 py-4 text-left text-sm font-bold">Date</th>
            {/* <th className="px-6 py-4 text-right text-sm font-bold">Action</th> */}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {subscribers.length === 0 ? (
            <tr>
              <td
                colSpan={4}
                className="px-6 py-8 text-center text-muted-foreground"
              >
                No subscribers found. Try adjusting your filters.
              </td>
            </tr>
          ) : (
            subscribers.map((sub, index) => (
              <motion.tr
                key={sub.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.03 * index }}
                className="hover:bg-gray-50 transition-colors"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={
                          sub.avatar ||
                          `https://api.dicebear.com/7.x/avataaars/svg?seed=${sub.id}`
                        }
                      />
                      <AvatarFallback className="bg-slate-200 text-slate-700 text-sm">
                        {getInitials(
                          sub.userName.split(' ')[0],
                          sub.userName.split(' ')[1]
                        )}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-semibold text-slate-800">
                      {sub.userName}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-slate-700">{sub.email}</span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-slate-700">
                    {formatDate(sub.date, 'dd-MM-yyyy')}
                  </span>
                </td>
                {/* <td className="px-6 py-4 text-right">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => onLock?.(sub)}
                    aria-label="Lock subscriber"
                  >
                    <Lock className="h-4 w-4" />
                  </Button>
                </td> */}
              </motion.tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
