import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Bell } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { SearchInput } from '@/components/common/SearchInput'
import { Pagination } from '@/components/common/Pagination'
import { NotificationTable } from './components/NotificationTable'
import { NotificationFilterDropdown } from './components/NotificationFilterDropdown'
import { SendNotificationModal } from './components/SendNotificationModal'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import {
  addNotification,
  setFilters,
  setPage,
  setLimit,
} from '@/redux/slices/pushNotificationSlice'
import { useUrlString, useUrlNumber } from '@/hooks/useUrlState'
import type { SendNotificationPayload } from '@/types'
import { format } from 'date-fns'

export default function PushNotificationList() {
  const dispatch = useAppDispatch()
  const [showSendModal, setShowSendModal] = useState(false)

  const [searchQuery, setSearchQuery] = useUrlString('search', '')
  const [typeFilter, setTypeFilter] = useUrlString('type', 'all')
  const [statusFilter, setStatusFilter] = useUrlString('status', 'all')
  const [currentPage, setCurrentPage] = useUrlNumber('page', 1)
  const [itemsPerPage, setItemsPerPage] = useUrlNumber('limit', 10)

  const { filteredList, pagination } = useAppSelector(
    (state) => state.pushNotifications
  )

  useEffect(() => {
    dispatch(
      setFilters({
        search: searchQuery,
        type: typeFilter,
        status: statusFilter,
      })
    )
  }, [searchQuery, typeFilter, statusFilter, dispatch])

  useEffect(() => {
    dispatch(setPage(currentPage))
  }, [currentPage, dispatch])

  useEffect(() => {
    dispatch(setLimit(itemsPerPage))
  }, [itemsPerPage, dispatch])

  const totalPages = pagination.totalPages
  const paginatedData = useMemo(() => {
    const startIndex = (pagination.page - 1) * pagination.limit
    return filteredList.slice(startIndex, startIndex + pagination.limit)
  }, [filteredList, pagination.page, pagination.limit])

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleItemsPerPageChange = (limit: number) => {
    setItemsPerPage(limit)
  }

  const handleNotificationSent = async (payload: SendNotificationPayload) => {
    dispatch(
      addNotification({
        id: `n-${Date.now()}`,
        title: payload.title,
        message: payload.message,
        type: payload.type,
        date: format(new Date(), 'yyyy-MM-dd'),
        status: 'Sent',
      })
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <Card className="bg-white border-0 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-6">
          <CardTitle className="text-xl font-bold text-slate-800">
            Push Notifications
          </CardTitle>
          <div className="flex items-center gap-3">
            <SearchInput
              value={searchQuery}
              onChange={(v) => {
                setSearchQuery(v)
                setCurrentPage(1)
              }}
              placeholder="Search title, message, type & status..."
              className="w-[300px]"
            />

            <NotificationFilterDropdown
              typeValue={typeFilter}
              statusValue={statusFilter}
              onTypeChange={(v) => {
                setTypeFilter(v)
                setCurrentPage(1)
              }}
              onStatusChange={(v) => {
                setStatusFilter(v)
                setCurrentPage(1)
              }}
            />

            <Button
              className="bg-slate-700 hover:bg-slate-800 text-white"
              onClick={() => setShowSendModal(true)}
            >
              <Bell className="h-4 w-4 mr-2" />
              Send a Notification
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <NotificationTable notifications={paginatedData} />

          <div className="px-6 py-4 border-t border-gray-100">
            <Pagination
              variant="revenue"
              currentPage={pagination.page}
              totalPages={totalPages}
              totalItems={filteredList.length}
              itemsPerPage={pagination.limit}
              onPageChange={handlePageChange}
              onItemsPerPageChange={handleItemsPerPageChange}
            />
          </div>
        </CardContent>
      </Card>

      <SendNotificationModal
        open={showSendModal}
        onClose={() => setShowSendModal(false)}
        onSent={handleNotificationSent}
      />
    </motion.div>
  )
}
