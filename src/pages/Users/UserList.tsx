import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Plus } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { SearchInput } from '@/components/common/SearchInput'
import { Pagination } from '@/components/common/Pagination'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { UserFilterDropdown } from './components/UserFilterDropdown'
import { UserTable } from './components/UserTable'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import { setFilters, setPage, setLimit, updateUserStatus } from '@/redux/slices/userSlice'
import { useUrlString, useUrlNumber } from '@/hooks/useUrlState'
import { toast } from '@/utils/toast'
import type { User, UserStatus } from '@/types'

export default function UserList() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isConfirmLoading, setIsConfirmLoading] = useState(false)

  const [searchQuery, setSearchQuery] = useUrlString('search', '')
  const [statusFilter, setStatusFilter] = useUrlString('status', 'all')
  const [currentPage, setCurrentPage] = useUrlNumber('page', 1)
  const [itemsPerPage, setItemsPerPage] = useUrlNumber('limit', 10)

  const { filteredList, pagination } = useAppSelector((state) => state.users)

  useEffect(() => {
    dispatch(
      setFilters({
        search: searchQuery,
        status: statusFilter as UserStatus | 'all',
        role: 'all',
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

  const handleView = (user: User) => {
    navigate(`/users/${user.id}`)
  }

  const handleLock = (user: User) => {
    setSelectedUser(user)
    setIsConfirmOpen(true)
  }

  const handleConfirmLock = async () => {
    if (!selectedUser) return

    setIsConfirmLoading(true)
    try {
      const nextStatus: UserStatus =
        selectedUser.status === 'blocked' ? 'active' : 'blocked'
      dispatch(updateUserStatus({ id: selectedUser.id, status: nextStatus }))
      toast({
        title: 'Success',
        description: `${selectedUser.firstName} ${selectedUser.lastName} is now ${nextStatus}.`,
        variant: 'success',
      })
      setIsConfirmOpen(false)
      setSelectedUser(null)
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to update user status. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsConfirmLoading(false)
    }
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleItemsPerPageChange = (limit: number) => {
    setItemsPerPage(limit)
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
            Users
          </CardTitle>
          <div className="flex items-center gap-3">
            <SearchInput
              value={searchQuery}
              onChange={(v) => {
                setSearchQuery(v)
                setCurrentPage(1)
              }}
              placeholder="Search name, ID & Status."
              className="w-[300px]"
            />

            <UserFilterDropdown
              value={statusFilter as UserStatus | 'all'}
              onChange={(v) => {
                setStatusFilter(v)
                setCurrentPage(1)
              }}
            />

            {/* <Button
              className="bg-primary-foreground hover:bg-blue-700 text-white"
              onClick={() => toast({ title: 'Add User', description: 'Add user modal coming soon.' })}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add User
            </Button> */}
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <UserTable
            users={paginatedData}
            onView={handleView}
            onLock={handleLock}
          />

          <div className="px-6 py-4 border-t border-gray-100">
            <Pagination
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

      {selectedUser && (
        <ConfirmDialog
          open={isConfirmOpen}
          onClose={() => {
            setIsConfirmOpen(false)
            setSelectedUser(null)
          }}
          onConfirm={handleConfirmLock}
          title={
            selectedUser.status === 'blocked' ? 'Activate User' : 'Block User'
          }
          description={`Are you sure you want to ${
            selectedUser.status === 'blocked' ? 'activate' : 'block'
          } ${selectedUser.firstName} ${selectedUser.lastName}?`}
          variant={selectedUser.status === 'blocked' ? 'info' : 'warning'}
          confirmText={
            selectedUser.status === 'blocked' ? 'Activate' : 'Block User'
          }
          isLoading={isConfirmLoading}
        />
      )}
    </motion.div>
  )
}
