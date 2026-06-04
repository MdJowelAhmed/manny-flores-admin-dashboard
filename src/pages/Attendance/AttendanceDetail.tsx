import { useState, useMemo, useEffect } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import moment from 'moment'
import { Calendar, UserCheck, UserX, Clock, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { Pagination } from '@/components/common/Pagination'
import { AttendanceDetailTable } from './AttendanceDetailTable'
import { ViewAttendanceDetailsModal } from './components/ViewAttendanceDetailsModal'
import { AddEditAttendanceModal } from './components/AddEditAttendanceModal'
import { type AttendanceRecord } from './attendanceData'
import { toast } from '@/utils/toast'
import { cn } from '@/utils/cn'
import { useSingleAttendanceQuery } from '@/redux/slices/super-admin/attendance'
import { getImageUrl } from '@/utils/getImageUrl'

const detailStats = [
  { key: 'totalDays', title: 'Total Days', icon: Calendar, iconBg: 'bg-blue-100', iconColor: 'text-blue-600' },
  { key: 'present', title: 'Present', icon: UserCheck, iconBg: 'bg-teal-100', iconColor: 'text-teal-600' },
  { key: 'absent', title: 'Absent', icon: UserX, iconBg: 'bg-amber-100', iconColor: 'text-amber-600' },
  { key: 'late', title: 'Late Arrivals', icon: Clock, iconBg: 'bg-green-100', iconColor: 'text-green-600' },
]

export default function AttendanceDetail() {
  const { userId } = useParams<{ userId: string }>()
  const { data: singleAttendance, isLoading: isSingleAttendanceLoading } = useSingleAttendanceQuery({
    id: userId || ""
  })
  console.log('Single Attendance Data:', userId)
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const currentPage = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
  const itemsPerPage = Math.max(1, parseInt(searchParams.get('limit') || '10', 10)) || 10

  const [records, setRecords] = useState<AttendanceRecord[]>([])

  useEffect(() => {
    if (singleAttendance?.data) {
      const mapped = singleAttendance.data.map((item: any) => {
        let mappedStatus: 'Present' | 'Late' | 'Absent' = 'Present'
        if (item.status) {
          const s = item.status.toUpperCase()
          if (s === 'PRESENT') mappedStatus = 'Present'
          else if (s === 'LATE') mappedStatus = 'Late'
          else if (s === 'ABSENT') mappedStatus = 'Absent'
        }

        return {
          id: item.id,
          profile: item.user?.profile || '',
          date: item.todayDate ? moment(item.todayDate).format('DD MMM, YYYY') : '',
          employee: item.user?.name || 'Unknown',
          project: 'General',
          checkIn: item.checkInTime ? moment(item.checkInTime).format('hh:mm A') : '--:--',
          checkOut: item.checkOutTime ? moment(item.checkOutTime).format('hh:mm A') : '--:--',
          totalHours: item.workingHours !== undefined ? `${item.workingHours}h` : '--:--',
          status: mappedStatus,
          isActive: true,
          userId: item.userId || item.user?.id || '',
        }
      })
      setRecords(mapped)
    }
  }, [singleAttendance])

  const employeeName = records[0]?.employee || 'Employee'
  
  const profile = getImageUrl(records[0]?.profile || '')
console.log('Mapped Attendance Records:',profile)
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [recordToDelete, setRecordToDelete] = useState<AttendanceRecord | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isStatusConfirmOpen, setIsStatusConfirmOpen] = useState(false)
  const [pendingStatusChange, setPendingStatusChange] = useState<{
    record: AttendanceRecord
    isActive: boolean
  } | null>(null)
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)

  const totalItems = singleAttendance?.pagination?.total || 0
  const totalPages = singleAttendance?.pagination?.totalPage || 1

  const setPage = (p: number) => {
    const next = new URLSearchParams(searchParams)
    p > 1 ? next.set('page', String(p)) : next.delete('page')
    setSearchParams(next, { replace: true })
  }
  const setLimit = (l: number) => {
    const next = new URLSearchParams(searchParams)
    l !== 10 ? next.set('limit', String(l)) : next.delete('limit')
    next.delete('page')
    setSearchParams(next, { replace: true })
  }

  useEffect(() => {
    if (currentPage > totalPages && totalPages >= 1) setPage(1)
  }, [totalPages, currentPage])

  const paginatedRecords = records

  const stats = useMemo(() => {
    const total = totalItems
    const present = records.filter((r) => r.status === 'Present').length
    const absent = records.filter((r) => r.status === 'Absent').length
    const late = records.filter((r) => r.status === 'Late').length
    return { totalDays: total, present, absent, late }
  }, [records, totalItems])

  const todayRecord = useMemo(() => {
    const today = moment().format('DD MMM, YYYY')
    return records.find((r) => r.date === today) ?? records[0]
  }, [records])

  const handleView = (r: AttendanceRecord) => {
    setSelectedRecord(r)
    setIsViewModalOpen(true)
  }

  const handleEdit = (r: AttendanceRecord, e: React.MouseEvent) => {
    e?.stopPropagation?.()
    setSelectedRecord(r)
    setIsAddEditModalOpen(true)
  }

  const handleSave = (data: Partial<AttendanceRecord>) => {
    if (data.id) {
      setRecords((prev) =>
        prev.map((r) =>
          r.id === data.id
            ? {
              ...r,
              ...data,
              date: data.date ?? r.date,
              status: data.status ?? r.status,
              checkIn: data.checkIn ?? r.checkIn,
              checkOut: data.checkOut ?? r.checkOut,
              totalHours: data.totalHours ?? r.totalHours,
              isActive: data.isActive ?? r.isActive,
            }
            : r
        )
      )
    }
    setIsAddEditModalOpen(false)
    setSelectedRecord(null)
  }

  const handleMarkAbsent = () => {
    if (selectedRecord) {
      setRecords((prev) =>
        prev.map((r) =>
          r.id === selectedRecord.id
            ? { ...r, status: 'Absent' as const, checkIn: '--:--', checkOut: '--:--', totalHours: '--:--' }
            : r
        )
      )
      toast({ variant: 'success', title: 'Updated', description: 'Marked as absent.' })
      setIsViewModalOpen(false)
      setSelectedRecord(null)
    }
  }

  const handleStatusChangeClick = (r: AttendanceRecord, isActive: boolean) => {
    setPendingStatusChange({ record: r, isActive })
    setIsStatusConfirmOpen(true)
  }

  const handleConfirmStatusChange = async () => {
    if (!pendingStatusChange) return
    setIsUpdatingStatus(true)
    try {
      await new Promise((r) => setTimeout(r, 200))
      setRecords((prev) =>
        prev.map((rec) =>
          rec.id === pendingStatusChange.record.id
            ? { ...rec, isActive: pendingStatusChange.isActive }
            : rec
        )
      )
      toast({
        variant: 'success',
        title: 'Status Updated',
        description: `Record marked as ${pendingStatusChange.isActive ? 'Active' : 'Inactive'}.`,
      })
      setIsStatusConfirmOpen(false)
      setPendingStatusChange(null)
    } catch {
      toast({ title: 'Error', description: 'Failed to update status.', variant: 'destructive' })
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  const handleDelete = (r: AttendanceRecord) => {
    setRecordToDelete(r)
    setIsConfirmOpen(true)
  }

  const handleDeleteFromView = () => {
    if (selectedRecord) {
      setRecordToDelete(selectedRecord)
      setIsViewModalOpen(false)
      setIsConfirmOpen(true)
    }
  }

  const handleConfirmDelete = async () => {
    if (!recordToDelete) return
    setIsDeleting(true)
    try {
      await new Promise((r) => setTimeout(r, 300))
      setRecords((prev) => prev.filter((r) => r.id !== recordToDelete.id))
      toast({ variant: 'success', title: 'Record Deleted', description: 'Attendance record removed.' })
      setIsConfirmOpen(false)
      setRecordToDelete(null)
      if (selectedRecord?.id === recordToDelete.id) setSelectedRecord(null)
    } catch {
      toast({ title: 'Error', description: 'Failed to delete.', variant: 'destructive' })
    } finally {
      setIsDeleting(false)
    }
  }

  if (isSingleAttendanceLoading) {
    return (
      <div className="flex items-center justify-center py-12 text-muted-foreground text-sm">
        Loading employee details...
      </div>
    )
  }

  if (!userId) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-muted-foreground mb-4">Employee not found</p>
        <Button variant="outline" onClick={() => navigate('/attendance')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Attendance
        </Button>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate('/attendance')}
        className="text-muted-foreground -ml-1"
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        Back
      </Button> */}

      {/* Profile + Current Day Summary */}
      <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={getImageUrl(records[0]?.profile || '')} alt={employeeName} />
            <AvatarFallback className="bg-primary/20 text-primary text-lg">
              {employeeName
                .split(' ')
                .map((s) => s[0])
                .join('')}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-xl font-bold text-foreground">{employeeName}</h1>
            <p className="text-sm text-muted-foreground">Employee</p>
          </div>
        </div>
        <div className="flex items-center gap-4 sm:gap-6 py-3 px-4 rounded-lg ">
          <div>
            <p className="text-sm text-muted-foreground mt-1">Check In</p>
            <p className="text-base font-bold text-foreground">{todayRecord?.checkIn ?? '--:--'}</p>
          </div>
          <div className="w-px h-10 bg-emerald-400" />
          <div>
            <p className="text-sm text-muted-foreground mt-1">Check Out</p>
            <p className="text-base font-bold text-foreground">{todayRecord?.checkOut ?? '--:--'}</p>
          </div>
          <div className="w-px h-10 bg-amber-400" />
          <div>
            <p className="text-sm text-muted-foreground mt-1">Today Working Period</p>
            <p className="text-base font-bold text-foreground">{todayRecord?.totalHours ?? '--:--'}</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {detailStats.map((s, index) => {
          const Icon = s.icon
          const value = stats[s.key as keyof typeof stats]
          return (
            <motion.div
              key={s.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="bg-white rounded-xl px-5 py-5 shadow-sm border border-gray-100"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{s.title}</p>
                  <h3 className="text-xl font-bold text-foreground mt-1">{value}</h3>
                </div>
                <div className={cn('p-2.5 rounded-lg', s.iconBg)}>
                  <Icon className={cn('h-5 w-5', s.iconColor)} />
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Attendance History Table */}
      <div className="rounded-xl border border-gray-100 bg-white overflow-hidden shadow-sm">

        <AttendanceDetailTable
          records={paginatedRecords}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onStatusChange={handleStatusChangeClick}
        />
        {records.length > 0 && (
          <div className="border-t border-gray-100 px-4 py-3">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={records.length}
              itemsPerPage={itemsPerPage}
              onPageChange={setPage}
              onItemsPerPageChange={setLimit}
              showItemsPerPage
            />
          </div>
        )}
      </div>

      <ViewAttendanceDetailsModal
        open={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false)
          setSelectedRecord(null)
        }}
        record={selectedRecord}
        onEdit={() => {
          setIsViewModalOpen(false)
          setIsAddEditModalOpen(true)
        }}
        onMarkAbsent={handleMarkAbsent}
        onDelete={handleDeleteFromView}
      />

      <AddEditAttendanceModal
        open={isAddEditModalOpen}
        onClose={() => {
          setIsAddEditModalOpen(false)
          setSelectedRecord(null)
        }}
        record={selectedRecord}
        onSave={handleSave}
      />

      <ConfirmDialog
        open={isConfirmOpen}
        onClose={() => {
          setIsConfirmOpen(false)
          setRecordToDelete(null)
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Attendance"
        description="Are you sure you want to delete this record? This action cannot be undone."
        confirmText="Delete"
        variant="danger"
        isLoading={isDeleting}
      />

      <ConfirmDialog
        open={isStatusConfirmOpen}
        onClose={() => {
          setIsStatusConfirmOpen(false)
          setPendingStatusChange(null)
        }}
        onConfirm={handleConfirmStatusChange}
        title="Change Status"
        description={
          pendingStatusChange
            ? `Are you sure you want to mark this record as ${pendingStatusChange.isActive ? 'Active' : 'Inactive'}?`
            : ''
        }
        confirmText="Update"
        variant="info"
        isLoading={isUpdatingStatus}
      />
    </motion.div>
  )
}
