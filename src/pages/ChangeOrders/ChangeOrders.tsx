import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { SlidersHorizontal, FileDown, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SearchInput } from '@/components/common/SearchInput'
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
  mockChangeOrders,
  statusFilterOptions,
  type ChangeOrder,
} from './changeOrdersData'
import { formatCurrency } from '@/utils/formatters'
import { cn } from '@/utils/cn'
import { toast } from '@/utils/toast'

export default function ChangeOrders() {
  const { t } = useTranslation()
  const [orders, setOrders] = useState<ChangeOrder[]>(mockChangeOrders)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedOrder, setSelectedOrder] = useState<ChangeOrder | null>(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isNewOrderOpen, setIsNewOrderOpen] = useState(false)

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchesSearch =
        !searchQuery ||
        o.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.serviceType.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.orderId.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = statusFilter === 'all' || o.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [orders, searchQuery, statusFilter])

  const handleViewDetails = (o: ChangeOrder) => {
    setSelectedOrder(o)
    setIsViewModalOpen(true)
  }

  const handleDownloadPdf = (o: ChangeOrder) => {
    const text = [
      o.orderId,
      o.customerName,
      `${t('changeOrders.originalCost')}: ${formatCurrency(o.originalCost)}`,
      `${t('changeOrders.additionalCost')}: +${formatCurrency(o.additionalCost)}`,
      `${t('changeOrders.newTotal')}: ${formatCurrency(o.newTotal)}`,
    ].join('\n')
    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${o.orderId}-summary.txt`
    a.click()
    URL.revokeObjectURL(url)
    toast({
      title: t('common.success'),
      description: t('changeOrders.pdfDownloadStarted'),
      variant: 'success',
    })
  }

  const handleCreateOrder = (order: ChangeOrder) => {
    setOrders((prev) => [order, ...prev])
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 min-h-[60vh] rounded-xl bg-muted/30 p-4 sm:p-6 -mx-4 sm:mx-0"
    >
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          {t('changeOrders.allChangeOrders')}
        </h1>
        <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder={t('changeOrders.searchDocuments')}
            className="w-full sm:w-[280px] bg-white rounded-lg border-gray-200"
            debounceMs={150}
          />
          <div className="w-full sm:w-[140px] shrink-0">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
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
          <Button
            type="button"
            onClick={() => setIsNewOrderOpen(true)}
            className="h-11 rounded-lg bg-primary hover:bg-primary/90 text-white gap-2"
          >
            <Plus className="h-4 w-4" />
            {t('changeOrders.newOrder')}
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="py-16 text-center text-muted-foreground text-sm rounded-xl border border-dashed bg-white/80">
            {t('changeOrders.noOrdersFound')}
          </div>
        ) : (
          filteredOrders.map((o, index) => (
            <motion.div
              key={o.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.02 * index }}
              className="rounded-xl border border-gray-200/90 bg-white p-4 sm:p-5 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                <div>
                  <h2 className="font-bold text-foreground text-base">{o.customerName}</h2>
                  <p className="text-sm text-muted-foreground mt-0.5">{o.serviceType}</p>
                </div>
                <span
                  className={cn(
                    'px-3 py-1 rounded-md text-xs font-semibold shrink-0',
                    o.status === 'Approved'
                      ? 'bg-primary/15 text-primary'
                      : 'bg-orange-100 text-orange-700'
                  )}
                >
                  {o.status}
                </span>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
                <div>
                  <span className="text-xs text-muted-foreground block mb-1">
                    {t('changeOrders.originalCost')}
                  </span>
                  <span className="text-sm font-bold text-foreground">{formatCurrency(o.originalCost)}</span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block mb-1">
                    {t('changeOrders.additionalCost')}
                  </span>
                  <span className="text-sm font-bold text-orange-600">+{formatCurrency(o.additionalCost)}</span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block mb-1">
                    {t('changeOrders.newTotal')}
                  </span>
                  <span className="text-sm font-bold text-primary">{formatCurrency(o.newTotal)}</span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block mb-1">
                    {t('changeOrders.requestDate')}
                  </span>
                  <span className="text-sm font-bold text-foreground">{o.requestDate}</span>
                </div>
              </div>

              <div className="flex flex-wrap justify-end gap-2 pt-1">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => handleDownloadPdf(o)}
                  className="rounded-lg border-red-200 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700"
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
          ))
        )}
      </div>

      <ViewChangeOrderDetailsModal
        open={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false)
          setSelectedOrder(null)
        }}
        order={selectedOrder}
      />

      <NewChangeOrderModal
        open={isNewOrderOpen}
        onClose={() => setIsNewOrderOpen(false)}
        onCreate={handleCreateOrder}
      />
    </motion.div>
  )
}
