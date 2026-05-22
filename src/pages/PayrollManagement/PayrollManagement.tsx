import { useState, useMemo, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { SlidersHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Pagination } from '@/components/common/Pagination'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { PayrollTable, type PayrollEntry } from './components/PayrollTable'
import { AddPayrollModal } from './components/AddPayrollModal'
import { PaymentDetailsModal } from './components/PaymentDetailsModal'
import { sonnerToast, toast } from '@/utils/toast'
import { SearchInput } from '@/components/common'
import { useChangePayrollStatusMutation, useGetAllCustomersQuery, useGetPayrollManagementQuery } from '@/redux/slices/super-admin/payrollApi'
import Spinner from '@/components/common/Spinner'

export default function PayrollManagement() {
  const { t } = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()
  const currentPage = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
  const itemsPerPage = Math.max(1, parseInt(searchParams.get('limit') || '10', 10)) || 10

  const [query, setQuery] = useState('')
  const [selectedRecord, setSelectedRecord] = useState<PayrollEntry | null>(null)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [recordToDelete, setRecordToDelete] = useState<PayrollEntry | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)


  // API CALLS
  const { data: payrollData, isLoading: payrollLoading, refetch } = useGetPayrollManagementQuery({ search: query, page: currentPage, limit: itemsPerPage })

  const [changePayrollStatus] = useChangePayrollStatusMutation()

  // ── Employee infinite-scroll state ─────────────────────────────────────────
  const [empSearch, setEmpSearch] = useState('')
  const [empPage, setEmpPage] = useState(1)
  const [empOptions, setEmpOptions] = useState<{ value: string; label: string }[]>([])

  const { data: customersData, isFetching: empLoading } = useGetAllCustomersQuery({
    search: empSearch,
    page: empPage,
  })


  // console.log('customersData', customersData)
  console.log('payrollData', payrollData)

  const records = useMemo(() => {
    return payrollData?.data || []
  }, [payrollData])

  const totalPages = Math.max(1, payrollData?.pagination?.totalPage || 1)

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

  const handleMarkPaid = async (r: PayrollEntry, e?: React.MouseEvent) => {
    e?.stopPropagation?.()
    if (r.paymentTypeStatus === 'PAID') return
    try {
      sonnerToast.promise(changePayrollStatus({ id: r.id, body: { paymentTypeStatus: "PAID" } }).unwrap(), {
        loading: 'Updating status...',
        success: (res) => {
          refetch()
          if (isDetailsModalOpen) {
            setIsDetailsModalOpen(false)
          }
          return res?.message || 'Status updated successfully'
        },
        error: 'Failed to update status',
      })

    } catch (err) {
      toast({ title: 'Error', description: 'Failed to update status', variant: 'destructive' })
    }
  }

  const handleView = (r: PayrollEntry) => {
    setSelectedRecord(r)
    setIsDetailsModalOpen(true)
  }

  const handleDeleteFromDetails = () => {
    setIsDetailsModalOpen(false)
    if (selectedRecord) {
      setRecordToDelete(selectedRecord)
      setIsConfirmOpen(true)
      setSelectedRecord(null)
    }
  }

  const handleDelete = (r: PayrollEntry) => {
    setRecordToDelete(r)
    setIsConfirmOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!recordToDelete) return
    setIsDeleting(true)
    try {
      await new Promise((res) => setTimeout(res, 300))
      // setRecords((prev) => prev.filter((rec) => rec.id !== recordToDelete.id))
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

  if (payrollLoading) return <Spinner />

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >

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
              toast({ title: t('common.filter'), description: 'Coming soon.', variant: 'info' })
            }}
          >
            <SlidersHorizontal className="h-5 w-5 text-slate-600" />
          </Button>
          <Button
            type="button"
            className="h-11 rounded-md"
            onClick={() => setIsAddModalOpen(true)}
          >
            Add Payroll
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-gray-100 bg-white overflow-hidden shadow-sm">

        <PayrollTable
          records={paginatedRecords}
          onView={handleView}
          onMarkPaid={handleMarkPaid}
          onDelete={handleDelete}
        />
        {records.length > 0 && (
          <div className="border-t border-gray-100 px-4 py-3">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={payrollData?.pagination?.total || records.length}
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
        onMarkPaid={() => {
          if (selectedRecord) {
            handleMarkPaid(selectedRecord)
          }
        }}
        onDelete={handleDeleteFromDetails}
      />

      <AddPayrollModal
        open={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        customersData={customersData}
        empPage={empPage}
        empOptions={empOptions}
        setEmpOptions={setEmpOptions}
        setEmpPage={setEmpPage}
        setEmpSearch={setEmpSearch}
        empLoading={empLoading}
        refetch={refetch}
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
