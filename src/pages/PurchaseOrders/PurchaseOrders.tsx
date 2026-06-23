import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { FileDown, Plus, SlidersHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SearchInput } from '@/components/common/SearchInput'
import { Pagination } from '@/components/common/Pagination'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import Spinner from '@/components/common/Spinner'
import { useDebounce } from '@/hooks/useDebounce'
import { formatCurrency } from '@/utils/formatters'
import { cn } from '@/utils/cn'
import { toast } from '@/utils/toast'
import { imageUrl } from '@/redux/baseApi'
import { useAppSelector } from '@/redux/hooks'
import { UserRole } from '@/types/roles'
import {
  useGetPurchaseOrdersQuery,
  useGetPurchaseOrdersOverviewQuery,
  useLazyGetPurchaseOrderPdfQuery,
} from '@/redux/slices/super-admin/purchaseOrdersApi'
import {
  getPurchaseOrderBuilderEmail,
  getPurchaseOrderBuilderName,
  getPurchaseOrderNumber,
  getPurchaseOrderProjectName,
  getPurchaseOrderStatusClass,
  getPurchaseOrderStatusLabel,
  purchaseOrderStats,
  statusFilterOptions,
  type PurchaseOrder,
} from './purchaseOrdersData'
import { NewPurchaseOrderModal } from './components/NewPurchaseOrderModal'
import { ViewPurchaseOrderDetailsModal } from './components/ViewPurchaseOrderDetailsModal'

export default function PurchaseOrders() {
  const { t } = useTranslation()
  const { user } = useAppSelector((state) => state.auth)
  const isManager =
    user?.role === UserRole.SUPER_ADMIN || user?.role === UserRole.ADMIN

  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedOrder, setSelectedOrder] = useState<PurchaseOrder | null>(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isNewModalOpen, setIsNewModalOpen] = useState(false)

  const debouncedSearch = useDebounce(searchQuery, 500)

  const { data: overviewRes, isLoading: overviewLoading } = useGetPurchaseOrdersOverviewQuery()
  const {
    data: ordersRes,
    isLoading: ordersLoading,
    refetch,
  } = useGetPurchaseOrdersQuery({
    search: debouncedSearch,
    page: currentPage,
    limit: 10,
    status: statusFilter,
  })

  const [triggerGetPdf, { isFetching: isPdfDownloading }] = useLazyGetPurchaseOrderPdfQuery()

  const orders = ordersRes?.data ?? []
  const totalItems = ordersRes?.pagination?.total ?? 0
  const totalPages = ordersRes?.pagination?.totalPage ?? 1
  const limit = ordersRes?.pagination?.limit ?? 10
  const overview = overviewRes?.data

  const summaryCards = useMemo(
    () =>
      purchaseOrderStats.map((stat) => {
        const rawValue = overview?.[stat.valueKey]
        const value =
          stat.isCurrency && typeof rawValue === 'number'
            ? formatCurrency(rawValue)
            : rawValue ?? 0
        return { ...stat, value }
      }),
    [overview]
  )

  const handleViewDetails = (order: PurchaseOrder) => {
    setSelectedOrder(order)
    setIsViewModalOpen(true)
  }

  const handleDownloadPdf = async (order: PurchaseOrder) => {
    try {
      const response = await triggerGetPdf(order.id).unwrap()
      const downloadUrl = response?.data?.downloadUrl || response?.downloadUrl
      if (downloadUrl) {
        const fullUrl = downloadUrl.startsWith('http') ? downloadUrl : `${imageUrl}${downloadUrl}`
        const a = document.createElement('a')
        a.href = fullUrl
        a.target = '_blank'
        a.download = `${getPurchaseOrderNumber(order)}.pdf`
        a.click()
        toast({
          title: t('common.success'),
          description: t('purchaseOrders.pdfDownloadStarted'),
          variant: 'success',
        })
      } else {
        toast({
          title: t('common.error'),
          description: t('purchaseOrders.pdfDownloadFailed'),
          variant: 'destructive',
        })
      }
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
          : t('purchaseOrders.pdfDownloadFailed')
      toast({ title: t('common.error'), description: message, variant: 'destructive' })
    }
  }

  if (ordersLoading || overviewLoading) return <Spinner />

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((stat, index) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={stat.titleKey}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="rounded-xl border border-gray-100 bg-white px-6 py-6 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{t(stat.titleKey)}</p>
                  <h3 className="mt-1 text-2xl font-bold text-foreground">{stat.value}</h3>
                </div>
                <div className={cn('rounded-lg p-3', stat.iconBg)}>
                  <Icon className={cn('h-6 w-6', stat.iconColor)} />
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {overview ? (
        <div className="rounded-xl border border-emerald-100 bg-emerald-50/70 px-5 py-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-emerald-900">
                {t('purchaseOrders.paymentSummary')}
              </p>
              <p className="mt-1 text-sm text-emerald-800">
                {t('purchaseOrders.paymentSummaryHint')}
              </p>
            </div>
            <div className="flex flex-wrap gap-6">
              <div>
                <p className="text-xs text-emerald-700">{t('purchaseOrders.totalAmount')}</p>
                <p className="text-lg font-bold text-emerald-900">
                  {formatCurrency(overview.totalAmount ?? 0)}
                </p>
              </div>
              <div>
                <p className="text-xs text-emerald-700">{t('purchaseOrders.totalSettled')}</p>
                <p className="text-lg font-bold text-emerald-900">
                  {formatCurrency(overview.totalPaid ?? 0)}
                </p>
              </div>
              <div>
                <p className="text-xs text-emerald-700">{t('purchaseOrders.outstanding')}</p>
                <p className="text-lg font-bold text-emerald-900">
                  {formatCurrency(overview.totalOutstanding ?? 0)}
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          {t('purchaseOrders.allPurchaseOrders')}
        </h1>
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <SearchInput
            value={searchQuery}
            onChange={(val) => {
              setSearchQuery(val)
              setCurrentPage(1)
            }}
            placeholder={t('purchaseOrders.searchOrders')}
            className="w-full bg-white sm:w-[280px]"
            debounceMs={150}
          />
          <div className="w-full sm:w-[140px]">
            <Select
              value={statusFilter}
              onValueChange={(value) => {
                setStatusFilter(value)
                setCurrentPage(1)
              }}
            >
              <SelectTrigger className="h-11 w-full border-0 bg-primary text-white hover:bg-primary/90 [&_svg]:text-white">
                <SlidersHorizontal className="mr-2 h-4 w-4 shrink-0" />
                <SelectValue placeholder={t('purchaseOrders.filter')} />
              </SelectTrigger>
              <SelectContent>
                {statusFilterOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {t(opt.labelKey)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {isManager ? (
            <Button
              type="button"
              onClick={() => setIsNewModalOpen(true)}
              className="h-11 gap-2 rounded-lg bg-primary text-white hover:bg-primary/90"
            >
              <Plus className="h-4 w-4" />
              {t('purchaseOrders.newPurchaseOrder')}
            </Button>
          ) : null}
        </div>
      </div>

      <div className="space-y-4">
        {orders.length === 0 ? (
          <div className="rounded-xl border border-dashed bg-white/80 py-16 text-center text-sm text-muted-foreground">
            {t('purchaseOrders.noOrdersFound')}
          </div>
        ) : (
          orders.map((order, index) => {
            const formattedDate = order.createdAt
              ? new Date(order.createdAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })
              : '—'

            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.02 * index }}
                className="rounded-xl border border-gray-200/90 bg-white p-4 shadow-sm sm:p-5"
              >
                <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      {getPurchaseOrderNumber(order)}
                    </p>
                    <h2 className="mt-1 text-base font-bold text-foreground">
                      {getPurchaseOrderProjectName(order)}
                    </h2>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      {getPurchaseOrderBuilderName(order)}
                    </p>
                    {getPurchaseOrderBuilderEmail(order) !== '—' ? (
                      <p className="text-xs text-muted-foreground">{getPurchaseOrderBuilderEmail(order)}</p>
                    ) : null}
                  </div>
                  <span
                    className={cn(
                      'shrink-0 rounded-md px-3 py-1 text-xs font-semibold',
                      getPurchaseOrderStatusClass(order.status)
                    )}
                  >
                    {getPurchaseOrderStatusLabel(order.status)}
                  </span>
                </div>

                <div className="mb-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
                  <div>
                    <span className="mb-1 block text-xs text-muted-foreground">
                      {t('purchaseOrders.amount')}
                    </span>
                    <span className="text-sm font-bold text-foreground">
                      {formatCurrency(order.amount)}
                    </span>
                  </div>
                  <div>
                    <span className="mb-1 block text-xs text-muted-foreground">
                      {t('purchaseOrders.dueDate')}
                    </span>
                    <span className="text-sm font-bold text-foreground">
                      {order.dueDate
                        ? new Date(order.dueDate).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })
                        : '—'}
                    </span>
                  </div>
                  <div>
                    <span className="mb-1 block text-xs text-muted-foreground">
                      {t('purchaseOrders.createdAt')}
                    </span>
                    <span className="text-sm font-bold text-foreground">{formattedDate}</span>
                  </div>
                  <div>
                    <span className="mb-1 block text-xs text-muted-foreground">
                      {t('purchaseOrders.paymentsCount')}
                    </span>
                    <span className="text-sm font-bold text-foreground">
                      {order.paymentHistory?.length ?? 0}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap justify-end gap-2 pt-1">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={isPdfDownloading}
                    onClick={() => handleDownloadPdf(order)}
                    className="rounded-lg border-red-200 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700"
                  >
                    <FileDown className="mr-1 h-4 w-4" />
                    {t('purchaseOrders.downloadPdf')}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => handleViewDetails(order)}
                    className="rounded-lg border-gray-200 text-muted-foreground hover:bg-muted/50"
                  >
                    {t('purchaseOrders.viewDetails')}
                  </Button>
                </div>
              </motion.div>
            )
          })
        )}
      </div>

      {totalItems > 0 ? (
        <div className="border-t border-gray-100 pt-4">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            itemsPerPage={limit}
            onPageChange={setCurrentPage}
            showItemsPerPage={false}
          />
        </div>
      ) : null}

      <ViewPurchaseOrderDetailsModal
        open={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false)
          setSelectedOrder(null)
        }}
        order={selectedOrder}
        canManageStatus={isManager}
        onUpdated={refetch}
      />

      {isManager ? (
        <NewPurchaseOrderModal
          open={isNewModalOpen}
          onClose={() => setIsNewModalOpen(false)}
          onCreated={refetch}
        />
      ) : null}
    </motion.div>
  )
}
