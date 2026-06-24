import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { SlidersHorizontal, FileDown, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SearchInput } from '@/components/common/SearchInput'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ViewChangeOrderDetailsModal } from './components/ViewChangeOrderDetailsModal'
import { NewChangeOrderModal } from './components/NewChangeOrderModal'
import {
  statusFilterOptions,
  getChangeOrderProjectName,
  getChangeOrderStatus,
  getChangeOrderCustomerEmail,
  getChangeOrderType,
  type ChangeOrder,
  type ChangeOrderProjectType,
} from './changeOrdersData'
import { formatCurrency } from '@/utils/formatters'
import { cn } from '@/utils/cn'
import { toast } from '@/utils/toast'
import { useGetChangeOrdersQuery, useGetCompanyChangeOrdersQuery, useLazyGetOrderPdfByIdQuery } from '@/redux/slices/super-admin/changeOrdersApi'
import Spinner from '@/components/common/Spinner'
import { useDebounce } from '@/hooks/useDebounce'
import { imageUrl } from '@/redux/baseApi'
import { Pagination } from '@/components/common/Pagination'
import { useAppSelector } from '@/redux/hooks'
import { UserRole } from '@/types/roles'

export default function ChangeOrders() {
  const { t } = useTranslation()
  const { user } = useAppSelector((state) => state.auth)
  const isBuilder = user?.role === UserRole.BUILDER
  const [activeTab, setActiveTab] = useState<ChangeOrderProjectType>('customer')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedOrder, setSelectedOrder] = useState<ChangeOrder | null>(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isNewOrderOpen, setIsNewOrderOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    if (isBuilder) {
      setActiveTab('company')
      setCurrentPage(1)
      setStatusFilter('all')
    }
  }, [isBuilder])

  const debouncedSearch = useDebounce(searchQuery, 500)

  const isCustomerTab = activeTab === 'customer'
  const queryParams = {
    search: debouncedSearch,
    page: currentPage,
    limit: 10,
    status: statusFilter,
  }

  const {
    data: customerOrdersData,
    isLoading: isCustomerLoading,
    isFetching: isCustomerFetching,
    refetch: refetchCustomerOrders,
  } = useGetChangeOrdersQuery(queryParams, { skip: !isCustomerTab })

  const {
    data: companyOrdersData,
    isLoading: isCompanyLoading,
    isFetching: isCompanyFetching,
    refetch: refetchCompanyOrders,
  } = useGetCompanyChangeOrdersQuery(queryParams, { skip: isCustomerTab })

  const changeOrdersData = isCustomerTab ? customerOrdersData : companyOrdersData
  const isChangeOrdersLoading = isCustomerTab ? isCustomerLoading : isCompanyLoading
  const isChangeOrdersFetching = isCustomerTab ? isCustomerFetching : isCompanyFetching
  const orders = changeOrdersData?.data ?? []

  const [triggerGetPdf, { isFetching: isPdfDownloading }] = useLazyGetOrderPdfByIdQuery()

  const handleTabChange = (value: string) => {
    setActiveTab(value as ChangeOrderProjectType)
    setCurrentPage(1)
    setSearchQuery('')
    setStatusFilter('all')
  }

  const handleViewDetails = (o: ChangeOrder) => {
    setSelectedOrder(o)
    setIsViewModalOpen(true)
  }

  const handleDownloadPdf = async (o: ChangeOrder) => {
    try {
      const response = await triggerGetPdf(o.id).unwrap()
      const downloadUrl = response?.data?.downloadUrl || response?.downloadUrl
      if (downloadUrl) {
        const fullUrl = downloadUrl.startsWith('http') ? downloadUrl : `${imageUrl}${downloadUrl}`
        const a = document.createElement('a')
        a.href = fullUrl
        a.target = '_blank'
        a.download = `change-order-${o.id}.pdf`
        a.click()
        toast({
          title: t('common.success'),
          description: t('changeOrders.pdfDownloadStarted'),
          variant: 'success',
        })
      } else {
        toast({
          title: t('common.error'),
          description: 'Download URL not found in response',
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
          : 'Failed to fetch/generate PDF'
      toast({ title: t('common.error'), description: message, variant: 'destructive' })
    }
  }

  const handleCreateOrder = () => {
    if (isCustomerTab) {
      refetchCustomerOrders()
    } else {
      refetchCompanyOrders()
    }
  }

  const totalItems = changeOrdersData?.pagination?.total || 0
  const totalPages = changeOrdersData?.pagination?.totalPage || 1
  const limit = changeOrdersData?.pagination?.limit || 10

  if (isChangeOrdersLoading) return <Spinner />

  const isListLoading = isChangeOrdersFetching && !isChangeOrdersLoading

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 min-h-[60vh] rounded-xl bg-muted/30 p-4 sm:p-6 -mx-4 sm:mx-0"
    >
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-4">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {t('changeOrders.allChangeOrders')}
            </h1>
            {!isBuilder && (
              <TabsList className="grid w-full max-w-xl grid-cols-2 bg-white p-1 h-auto rounded-lg border border-gray-200">
                <TabsTrigger value="customer" className="rounded-md">
                  {t('changeOrders.customerProjectsTab')}
                </TabsTrigger>
                <TabsTrigger value="company" className="rounded-md">
                  {t('changeOrders.companyProjectsTab')}
                </TabsTrigger>
              </TabsList>
            )}
          </div>

          <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3">
            <SearchInput
              value={searchQuery}
              onChange={(val) => {
                setSearchQuery(val)
                setCurrentPage(1)
              }}
              placeholder={t('changeOrders.searchDocuments')}
              className="w-full sm:w-[280px] bg-white rounded-lg border-gray-200"
              debounceMs={150}
            />
            <div className="w-full sm:w-[140px] shrink-0">
              <Select
                value={statusFilter}
                onValueChange={(value) => {
                  setStatusFilter(value)
                  setCurrentPage(1)
                }}
              >
                <SelectTrigger className="w-full h-11 bg-primary text-white hover:bg-primary/90 border-0 [&_svg]:text-white">
                  <SlidersHorizontal className="h-4 w-4 mr-2 shrink-0" />
                  <SelectValue placeholder={t('changeOrders.filter')} />
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
            {!isBuilder && (
              <Button
                type="button"
                onClick={() => setIsNewOrderOpen(true)}
                className="h-11 rounded-lg bg-primary hover:bg-primary/90 text-white gap-2"
              >
                <Plus className="h-4 w-4" />
                {t('changeOrders.newOrder')}
              </Button>
            )}
          </div>
        </div>

        <div className="space-y-4 relative">
          {isListLoading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-white/60">
              <Spinner />
            </div>
          )}
          {orders.length === 0 ? (
            <div className="py-16 text-center text-muted-foreground text-sm rounded-xl border border-dashed bg-white/80">
              {activeTab === 'company'
                ? t('changeOrders.noCompanyOrdersFound')
                : t('changeOrders.noOrdersFound')}
            </div>
          ) : (
            orders.map((o: ChangeOrder, index: number) => {
              const formattedDate = o.createdAt
                ? new Date(o.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })
                : '—'
              const currentStatus = getChangeOrderStatus(o)
              const projectName = getChangeOrderProjectName(o)
              const contactEmail = getChangeOrderCustomerEmail(o)
              const isCompanyOrder = getChangeOrderType(o) === 'company'

              return (
                <motion.div
                  key={o.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.02 * index }}
                  className="rounded-xl border border-gray-200/90 bg-white p-4 sm:p-5 shadow-sm"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                    <div>
                      <h2 className="font-bold text-foreground text-base">{projectName}</h2>
                      {contactEmail !== '—' && (
                        <p className="text-sm text-muted-foreground mt-0.5">
                          {isCompanyOrder
                            ? `${t('changeOrders.builderContact')}: ${contactEmail}`
                            : contactEmail}
                        </p>
                      )}
                    </div>
                    <span
                      className={cn(
                        'px-3 py-1 rounded-md text-xs font-semibold shrink-0',
                        currentStatus === 'Approved'
                          ? 'bg-primary/15 text-primary'
                          : 'bg-orange-100 text-orange-700'
                      )}
                    >
                      {currentStatus}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
                    <div>
                      <span className="text-xs text-muted-foreground block mb-1">
                        {t('changeOrders.originalCost')}
                      </span>
                      <span className="text-sm font-bold text-foreground">
                        {formatCurrency(o.originalCost ?? 0)}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground block mb-1">
                        {t('changeOrders.additionalCost')}
                      </span>
                      <span className="text-sm font-bold text-orange-600">
                        +{formatCurrency(o.additionalCost ?? 0)}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground block mb-1">
                        {t('changeOrders.newTotal')}
                      </span>
                      <span className="text-sm font-bold text-primary">
                        {formatCurrency(
                          o.totalCost ?? (o.originalCost ?? 0) + (o.additionalCost ?? 0)
                        )}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground block mb-1">
                        {t('changeOrders.requestDate')}
                      </span>
                      <span className="text-sm font-bold text-foreground">{formattedDate}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap justify-end gap-2 pt-1">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={isPdfDownloading}
                      onClick={() => handleDownloadPdf(o)}
                      className="rounded-lg border-red-200 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 disabled:opacity-50"
                    >
                      <FileDown className="h-4 w-4 mr-1" />
                      {t('changeOrders.downloadPdf')}
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => handleViewDetails(o)}
                      className="rounded-lg border-gray-200 text-muted-foreground hover:bg-muted/50"
                    >
                      {t('changeOrders.viewDetails')}
                    </Button>
                  </div>
                </motion.div>
              )
            })
          )}
        </div>
      </Tabs>

      {totalItems > 0 && (
        <div className="border-t border-gray-100 px-5 py-4">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            itemsPerPage={limit}
            onPageChange={setCurrentPage}
            showItemsPerPage={false}
          />
        </div>
      )}

      <ViewChangeOrderDetailsModal
        open={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false)
          setSelectedOrder(null)
        }}
        order={selectedOrder}
      />

      {!isBuilder && (
        <NewChangeOrderModal
          open={isNewOrderOpen}
          onClose={() => setIsNewOrderOpen(false)}
          onCreate={handleCreateOrder}
          projectType={activeTab}
        />
      )}
    </motion.div>
  )
}
