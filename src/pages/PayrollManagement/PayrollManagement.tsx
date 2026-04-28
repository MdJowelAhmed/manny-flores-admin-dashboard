import { useState, useMemo, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { SlidersHorizontal } from 'lucide-react'
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
import { SearchInput } from '@/components/common'

export default function PayrollManagement() {
  const { t } = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()
  const currentPage = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
  const itemsPerPage = Math.max(1, parseInt(searchParams.get('limit') || '10', 10)) || 10

  const [records, setRecords] = useState<PayrollRecord[]>(mockPayrollData)
  const [query, setQuery] = useState('')
  const [selectedRecord, setSelectedRecord] = useState<PayrollRecord | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [recordToDelete, setRecordToDelete] = useState<PayrollRecord | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const filteredRecords = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return records
    return records.filter((r) => {
      return (
        r.payrollId.toLowerCase().includes(q) ||
        r.name.toLowerCase().includes(q) ||
        r.payType.toLowerCase().includes(q) ||
        r.project.toLowerCase().includes(q) ||
        r.status.toLowerCase().includes(q)
      )
    })
  }, [records, query])

  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / itemsPerPage))

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
    return filteredRecords.slice(start, start + itemsPerPage)
  }, [filteredRecords, currentPage, itemsPerPage])

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
        title: t('payrollManagement.recordDeleted'),
        description: t('payrollManagement.recordRemoved'),
      })
      setIsConfirmOpen(false)
      setRecordToDelete(null)
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
      <div className="grid gap-4 md:grid-cols-3">
        {payrollStats.map((stat, index) => {
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

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-base font-semibold text-slate-900">
          {t('payrollManagement.employeePayrollDetails')}
        </h2>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <SearchInput
            value={query}
            onChange={(v) => {
              setQuery(v)
              setPage(1)
            }}
            placeholder={t('payrollManagement.searchPayroll')}
            className="w-full sm:w-[360px]"
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-11 w-11 rounded-md border-gray-200"
            onClick={() => {
              // Placeholder for filter UI (future). Keep button for design parity.
              toast({ title: t('common.filter'), description: 'Coming soon.', variant: 'info' })
            }}
          >
            <SlidersHorizontal className="h-5 w-5 text-slate-600" />
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-gray-100 bg-white overflow-hidden shadow-sm">
        
        <PayrollTable
          records={paginatedRecords}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
        {filteredRecords.length > 0 && (
          <div className="border-t border-gray-100 px-4 py-3">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredRecords.length}
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
        title={t('payrollManagement.deletePayrollRecord')}
        description={t('payrollManagement.deletePayrollRecordConfirm')}
        confirmText={t('common.delete')}
        cancelText={t('common.cancel')}
        variant="danger"
        isLoading={isDeleting}
      />
    </motion.div>
  )
}
