import { useState, useMemo, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'

import { Pagination } from '@/components/common/Pagination'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { AttendanceTable } from './components/AttendanceTable'
import { AddEditAttendanceModal } from './components/AddEditAttendanceModal'
import {
  attendanceStats,
  mockAttendanceData,
  getEmployeeSlug,
  type AttendanceRecord,
} from './attendanceData'
import { toast } from '@/utils/toast'
import { cn } from '@/utils/cn'

export default function Attendance() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const currentPage = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
  const itemsPerPage = Math.max(1, parseInt(searchParams.get('limit') || '10', 10)) || 10

  const [records, setRecords] = useState<AttendanceRecord[]>(mockAttendanceData)
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null)
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

  const totalPages = Math.max(1, Math.ceil(records.length / itemsPerPage))

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

  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return records.slice(start, start + itemsPerPage)
  }, [records, currentPage, itemsPerPage])

  const handleView = (r: AttendanceRecord) => {
    navigate(`/attendance/employee/${getEmployeeSlug(r.employee)}`)
  }

  const handleEdit = (r: AttendanceRecord, e: React.MouseEvent) => {
    e?.stopPropagation?.()
    setSelectedRecord(r)
    setIsAddEditModalOpen(true)
  }

  // const handleAdd = () => {
  //   setSelectedRecord(null)
  //   setIsAddEditModalOpen(true)
  // }

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
    } else {
      const newRecord: AttendanceRecord = {
        id: `att-${Date.now()}`,
        date: data.date ?? '',
        employee: data.employee ?? 'New Employee',
        project: data.project ?? 'General',
        checkIn: data.checkIn ?? '--:--',
        checkOut: data.checkOut ?? '--:--',
        totalHours: data.totalHours ?? '--:--',
        status: (data.status as AttendanceRecord['status']) ?? 'Present',
        isActive: true,
      }
      setRecords((prev) => [newRecord, ...prev])
    }
    setIsAddEditModalOpen(false)
    setSelectedRecord(null)
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
        title: t('attendance.statusUpdated'),
        description: t('attendance.recordMarkedAs', {
          status: pendingStatusChange.isActive ? t('attendance.active') : t('attendance.inactive'),
        }),
      })
      setIsStatusConfirmOpen(false)
      setPendingStatusChange(null)
    } catch {
      toast({ title: t('common.error'), description: t('attendance.failedToUpdateStatus'), variant: 'destructive' })
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  const handleDelete = (r: AttendanceRecord) => {
    setRecordToDelete(r)
    setIsConfirmOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!recordToDelete) return
    setIsDeleting(true)
    try {
      await new Promise((r) => setTimeout(r, 300))
      setRecords((prev) => prev.filter((r) => r.id !== recordToDelete.id))
      toast({
        variant: 'success',
        title: t('attendance.recordDeleted'),
        description: t('attendance.recordRemoved'),
      })
      setIsConfirmOpen(false)
      setRecordToDelete(null)
      setSelectedRecord(null)
    } catch {
      toast({ title: t('common.error'), description: t('common.error'), variant: 'destructive' })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {attendanceStats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={stat.titleKey}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="bg-white rounded-xl px-5 py-5 shadow-sm border border-gray-100"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{t(stat.titleKey)}</p>
                  <h3 className="text-xl font-bold text-foreground mt-1">{stat.value}</h3>
                </div>
                <div className={cn('p-2.5 rounded-lg', stat.iconBg)}>
                  <Icon className={cn('h-5 w-5', stat.iconColor)} />
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Table */}
      <div className="rounded-xl border border-gray-100 bg-white overflow-hidden shadow-sm">
        {/* <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <h2 className="text-base font-semibold text-accent">Attendance Records</h2>
          <Button
            size="sm"
            onClick={handleAdd}
            className="bg-primary hover:bg-primary/90 text-white"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add
          </Button>
        </div> */}
        <AttendanceTable
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
        title={t('attendance.deleteAttendance')}
        description={t('attendance.deleteAttendanceConfirm')}
        confirmText={t('common.delete')}
        cancelText={t('common.cancel')}
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
        title={t('attendance.changeStatus')}
        description={
          pendingStatusChange
            ? t('attendance.changeStatusConfirm', {
                status: pendingStatusChange.isActive ? t('attendance.active') : t('attendance.inactive'),
              })
            : ''
        }
        confirmText={t('attendance.update')}
        cancelText={t('common.cancel')}
        variant="info"
        isLoading={isUpdatingStatus}
      />
    </motion.div>
  )
}
