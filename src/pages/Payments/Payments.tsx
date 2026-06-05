import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'

import { ModalWrapper } from '@/components/common/ModalWrapper'
import { SearchInput } from '@/components/common/SearchInput'
import {
  useGetPaymentsQuery,
  usePaymentStatusUpdateMutation,
  mapPaymentFromApi,
  type PaymentStatusUpdate,
} from '@/redux/api/paymentApi'
import { DEFAULT_PAGINATION } from '@/utils/constants'
import { toast } from '@/utils/toast'

import { formatPaymentMethod, type PaymentListItem } from './paymentsData'
import { PaymentStatsCards } from './components/PaymentStatsCards'
import { PaymentsTableSection } from './components/PaymentsTableSection'

function isPendingStatus(status: string) {
  const normalized = status?.toLowerCase()
  return normalized === 'pending' || normalized === 'request_for_complete'
}

export default function Payments() {
  const { t } = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()
  const currentPage = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
  const itemsPerPage =
    Math.max(1, parseInt(searchParams.get('limit') || String(DEFAULT_PAGINATION.limit), 10)) ||
    DEFAULT_PAGINATION.limit

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRecord, setSelectedRecord] = useState<PaymentListItem | null>(null)
  const [checkModalOpen, setCheckModalOpen] = useState(false)
  const [updatingPaymentId, setUpdatingPaymentId] = useState<string | null>(null)

  const [updatePaymentStatus] = usePaymentStatusUpdateMutation()

  const {
    data: paymentsResponse,
    isLoading,
    isFetching,
  } = useGetPaymentsQuery({
    page: currentPage,
    limit: itemsPerPage,
    search: searchQuery,
  })

  const payments = useMemo(
    () => (paymentsResponse?.data ?? []).map(mapPaymentFromApi),
    [paymentsResponse]
  )

  const pagination = paymentsResponse?.pagination
  const totalPages = pagination?.totalPage ?? 1
  const totalItems = pagination?.total ?? payments.length

  const totals = useMemo(() => {
    const totalCollected = payments.reduce(
      (sum, r) => (r.status?.toLowerCase() === 'completed' && r.amount != null ? sum + r.amount : sum),
      0
    )
    const totalOutstanding = payments.reduce(
      (sum, r) => (isPendingStatus(r.status) && r.amount != null ? sum + r.amount : sum),
      0
    )
    const pendingApprovals = payments.filter((r) => isPendingStatus(r.status)).length
    const totalProjects = new Set(payments.map((r) => r.estimateId).filter(Boolean)).size
    return { totalCollected, totalOutstanding, pendingApprovals, totalProjects }
  }, [payments])

  const setPage = (p: number) => {
    const next = new URLSearchParams(searchParams)
    p > 1 ? next.set('page', String(p)) : next.delete('page')
    setSearchParams(next, { replace: true })
  }

  const setLimit = (l: number) => {
    const next = new URLSearchParams(searchParams)
    l !== DEFAULT_PAGINATION.limit ? next.set('limit', String(l)) : next.delete('limit')
    next.delete('page')
    setSearchParams(next, { replace: true })
  }

  useEffect(() => {
    if (currentPage > totalPages && totalPages >= 1) setPage(1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalPages])

  const openCheckModal = (record: PaymentListItem) => {
    setSelectedRecord(record)
    setCheckModalOpen(true)
  }

  const handleStatusUpdate = async (id: string, status: PaymentStatusUpdate) => {
    setUpdatingPaymentId(id)
    try {
      await updatePaymentStatus({ id, status }).unwrap()
      toast({
        variant: 'success',
        title: t('common.success'),
        description:
          status === 'completed'
            ? t('payments.toast.completedDesc')
            : t('payments.toast.rejectedDesc'),
      })
    } catch (err: unknown) {
      const message =
        err &&
        typeof err === 'object' &&
        'data' in err &&
        err.data &&
        typeof err.data === 'object' &&
        'message' in err.data &&
        typeof err.data.message === 'string'
          ? err.data.message
          : t('payments.toast.statusUpdateFailed')
      toast({ title: t('common.error'), description: message, variant: 'destructive' })
    } finally {
      setUpdatingPaymentId(null)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <PaymentStatsCards
        totalCollected={totals.totalCollected}
        totalOutstanding={totals.totalOutstanding}
        pendingApprovals={totals.pendingApprovals}
        totalProjects={totals.totalProjects}
      />

      <div className="flex items-center justify-end">
        <SearchInput
          value={searchQuery}
          onChange={(value) => {
            setSearchQuery(value)
            setPage(1)
          }}
          placeholder={t('payments.searchPlaceholder')}
          className="w-[280px] bg-white"
          debounceMs={300}
        />
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {isLoading || isFetching ? (
          <div className="px-5 py-10 text-center text-sm text-muted-foreground">
            {t('common.loading')}
          </div>
        ) : (
          <PaymentsTableSection
            paginatedRecords={payments}
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={setPage}
            onItemsPerPageChange={setLimit}
            onViewCheckImage={openCheckModal}
            onStatusUpdate={handleStatusUpdate}
            updatingPaymentId={updatingPaymentId}
          />
        )}
      </div>

      <ModalWrapper
        open={checkModalOpen}
        onClose={() => {
          setCheckModalOpen(false)
          setSelectedRecord(null)
        }}
        title={t('payments.proof.title')}
        description={
          selectedRecord
            ? `${selectedRecord.projectName} • ${formatPaymentMethod(selectedRecord.method)}`
            : undefined
        }
        size="lg"
        className="max-w-xl bg-white"
      >
        {selectedRecord?.checkImageUrl ? (
          <div className="rounded-lg border bg-muted/20 p-3">
            <img
              src={selectedRecord.checkImageUrl}
              alt="check"
              className="w-full max-h-[420px] object-contain rounded-md bg-white"
            />
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">{t('payments.noCheckImage')}</p>
        )}
      </ModalWrapper>
    </motion.div>
  )
}
