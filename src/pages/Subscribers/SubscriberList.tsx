import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Mail } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { SearchInput } from '@/components/common/SearchInput'
import { Pagination } from '@/components/common/Pagination'
import { SubscriberTable } from './components/SubscriberTable'
import { SubscriberFilterDropdown } from './components/SubscriberFilterDropdown'
import { WriteMailModal } from './components/WriteMailModal'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import {
  setFilters,
  setPage,
  setLimit,
} from '@/redux/slices/subscriberSlice'
import { useUrlString, useUrlNumber } from '@/hooks/useUrlState'
import type { Subscriber } from '@/types'
import type { SendMailPayload } from '@/types'

export default function SubscriberList() {
  const dispatch = useAppDispatch()
  const [showWriteMail, setShowWriteMail] = useState(false)

  const [searchQuery, setSearchQuery] = useUrlString('search', '')
  const [statusFilter, setStatusFilter] = useUrlString('status', 'all')
  const [currentPage, setCurrentPage] = useUrlNumber('page', 1)
  const [itemsPerPage, setItemsPerPage] = useUrlNumber('limit', 10)

  const { filteredList, pagination } = useAppSelector((state) => state.subscribers)

  useEffect(() => {
    dispatch(
      setFilters({
        search: searchQuery,
        status: statusFilter,
      })
    )
  }, [searchQuery, statusFilter, dispatch])

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

  const handleLock = (_sub: Subscriber) => {
    // Optional: open confirm dialog or call API to lock subscriber
  }

  const handleMailSent = async (_payload: SendMailPayload) => {
    // Wire to API when endpoint is ready, e.g.:
    // await subscriberApi.sendMail(payload)
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
            Subscribers
          </CardTitle>
          <div className="flex items-center gap-3">
            <SearchInput
              value={searchQuery}
              onChange={(v) => {
                setSearchQuery(v)
                setCurrentPage(1)
              }}
              placeholder="Search name, email & Status..."
              className="w-[300px]"
            />

            {/* <SubscriberFilterDropdown
              value={statusFilter}
              onChange={(v) => {
                setStatusFilter(v)
                setCurrentPage(1)
              }}
            /> */}

            <Button
              className="bg-primary hover:bg-primary/90 text-white"
              onClick={() => setShowWriteMail(true)}
            >
              <Mail className="h-4 w-4 mr-2" />
              Send a Message
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <SubscriberTable
            subscribers={paginatedData}
            onLock={handleLock}
          />

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

      <WriteMailModal
        open={showWriteMail}
        onClose={() => setShowWriteMail(false)}
        onSent={handleMailSent}
      />
    </motion.div>
  )
}
