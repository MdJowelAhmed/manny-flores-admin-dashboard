import { useState, useMemo, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CreditCard,  } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Pagination } from '@/components/common/Pagination'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { PayrollTable } from './components/PayrollTable'
import { CreateEditPaymentModal } from './components/CreateEditPaymentModal'
import { PaymentDetailsModal } from './components/PaymentDetailsModal'
import {
  payrollStats,
  mockPayrollData,
  type PayrollRecord,
} from './payrollData'
import { toast } from '@/utils/toast'
import { cn } from '@/utils/cn'

export default function PayrollManagement() {
  const [searchParams, setSearchParams] = useSearchParams()
  const currentPage = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
  const itemsPerPage = Math.max(1, parseInt(searchParams.get('limit') || '10', 10)) || 10

  const [records, setRecords] = useState<PayrollRecord[]>(mockPayrollData)
  const [selectedRecord, setSelectedRecord] = useState<PayrollRecord | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [recordToDelete, setRecordToDelete] = useState<PayrollRecord | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

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

  const handleCreate = () => {
    setSelectedRecord(null)
    setIsModalOpen(true)
  }

  const handleEdit = (r: PayrollRecord, e: React.MouseEvent) => {
    e?.stopPropagation?.()
    setSelectedRecord(r)
    setIsModalOpen(true)
  }

  const handleView = (r: PayrollRecord) => {
    setSelectedRecord(r)
    setIsDetailsModalOpen(true)
  }

  const handleEditFromDetails = () => {
    setIsDetailsModalOpen(false)
    if (selectedRecord) setIsModalOpen(true)
  }

  const handleDeleteFromDetails = () => {
    setIsDetailsModalOpen(false)
    if (selectedRecord) {
      setRecordToDelete(selectedRecord)
      setIsConfirmOpen(true)
      setSelectedRecord(null)
    }
  }

  const handleSave = (data: Partial<PayrollRecord>) => {
    if (data.id) {
      setRecords((prev) =>
        prev.map((rec) =>
          rec.id === data.id
            ? {
                ...rec,
                ...data,
                name: data.name ?? rec.name,
                payType: data.payType ?? rec.payType,
                project: data.project ?? rec.project,
                overtime: data.overtime ?? rec.overtime,
                amount: data.amount ?? rec.amount,
              }
            : rec
        )
      )
    } else {
      const nextId = String(187650 + records.length + 1)
      const newRecord: PayrollRecord = {
        id: `pr-${Date.now()}`,
        payrollId: `#${nextId}`,
        name: data.name ?? '',
        payType: (data.payType as PayrollRecord['payType']) ?? 'Monthly',
        project: data.project ?? '',
        overtime: data.overtime ?? 0,
        amount: data.amount ?? 0,
        status: (data.status as PayrollRecord['status']) ?? 'Pending',
      }
      setRecords((prev) => [newRecord, ...prev])
    }
    setIsModalOpen(false)
    setSelectedRecord(null)
  }

  const handleDelete = (r: PayrollRecord) => {
    setRecordToDelete(r)
    setIsConfirmOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!recordToDelete) return
    setIsDeleting(true)
    try {
      await new Promise((res) => setTimeout(res, 300))
      setRecords((prev) => prev.filter((rec) => rec.id !== recordToDelete.id))
      toast({
        variant: 'success',
        title: 'Record Deleted',
        description: 'Payroll record has been removed.',
      })
      setIsConfirmOpen(false)
      setRecordToDelete(null)
    } catch {
      toast({ title: 'Error', description: 'Failed to delete.', variant: 'destructive' })
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
      <div className="grid gap-4 md:grid-cols-3">
        {payrollStats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="bg-white rounded-xl px-5 py-5 shadow-sm border border-gray-100"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
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

      <div className="flex items-center justify-between ">
          <h2 className="text-base font-semibold text-accent">Employee Payroll Details</h2>
          <Button
            size="sm"
            onClick={handleCreate}
            className="bg-primary hover:bg-primary/90 text-white px"
          >
            <span className="flex items-center justify-center w-6 h-6 rounded mr-2">
              <CreditCard className="h-3.5 w-3.5" />
            </span>
            Create Payment
          </Button>
        </div>

      {/* Table */}
      <div className="rounded-xl border border-gray-100 bg-white overflow-hidden shadow-sm">
        
        <PayrollTable
          records={paginatedRecords}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
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

      <PaymentDetailsModal
        open={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false)
          setSelectedRecord(null)
        }}
        record={selectedRecord}
        onEdit={handleEditFromDetails}
        onDelete={handleDeleteFromDetails}
      />

      <CreateEditPaymentModal
        open={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
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
        title="Delete Payroll Record"
        description="Are you sure you want to delete this payroll record? This action cannot be undone."
        confirmText="Delete"
        variant="danger"
        isLoading={isDeleting}
      />
    </motion.div>
  )
}
