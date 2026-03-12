import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Info, SlidersHorizontal, FileDown } from 'lucide-react'
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
import { UpdateStatusModal } from './components/UpdateStatusModal'
import {
  changeOrderStats,
  mockChangeOrders,
  statusFilterOptions,
  type ChangeOrder,
  type ChangeOrderStatus,
} from './changeOrdersData'
import { formatCurrency } from '@/utils/formatters'
import { cn } from '@/utils/cn'

export default function ChangeOrders() {
  const [orders, setOrders] = useState<ChangeOrder[]>(mockChangeOrders)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedOrder, setSelectedOrder] = useState<ChangeOrder | null>(null)
  const [orderForStatusUpdate, setOrderForStatusUpdate] = useState<ChangeOrder | null>(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false)

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchesSearch =
        !searchQuery ||
        o.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.orderId.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus =
        statusFilter === 'all' || o.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [orders, searchQuery, statusFilter])

  const handleViewDetails = (o: ChangeOrder) => {
    setSelectedOrder(o)
    setIsViewModalOpen(true)
  }

  const handleDownloadPdf = (o: ChangeOrder) => {
    // Placeholder - can integrate PDF export later
    console.log('Download PDF:', o.orderId)
  }

  const handleStatusClick = (o: ChangeOrder) => {
    setOrderForStatusUpdate(o)
    setIsStatusModalOpen(true)
  }

  const handleStatusUpdate = (orderId: string, status: ChangeOrderStatus) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status } : o))
    )
    if (selectedOrder?.id === orderId) {
      setSelectedOrder((prev) => (prev ? { ...prev, status } : null))
    }
  }

  const stats = useMemo(() => {
    const total = orders.length
    const awaiting = orders.filter((o) => o.status === 'Pending').length
    const revenue = orders.reduce((sum, o) => sum + o.additionalCost, 0)
    return [
      { ...changeOrderStats[0], value: total },
      { ...changeOrderStats[1], value: awaiting },
      { ...changeOrderStats[2], value: revenue },
    ]
  }, [orders])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Info Banner */}
      <div className="flex gap-3 p-4 rounded-xl bg-[#F66E1033] border border-amber-100">
        
          <Info className="h-5 w-5 text-amber-600" />
       
        <div>
          <h3 className="font-semibold text-foreground">Change Order Process</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Change orders document any modifications to the original project
            scope, including additional work, material upgrades, or design
            changes. Customers must review and approve all change orders before
            work proceeds.
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat, index) => {
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
                  <p className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </p>
                  <h3 className="text-xl font-bold text-foreground mt-1">
                    {stat.title.includes('Revenue')
                      ? formatCurrency(stat.value)
                      : stat.value}
                  </h3>
                </div>
                <div className={cn('p-2.5 rounded-lg', stat.iconBg)}>
                  <Icon className={cn('h-5 w-5', stat.iconColor)} />
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* All Change Orders */}
      <div className="rounded-xl  overflow-hidden shadow-sm ">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6  0">
          <h2 className="text-base font-bold text-accent">All Change Orders</h2>
          <div className="flex items-center gap-2">
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search documents..."
              className="w-[280px] bg-white"
              debounceMs={150}
            />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[120px] h-[44px] bg-primary text-white hover:bg-primary/90 border-0">
                <SlidersHorizontal className="h-4 w-4 mr-1 shrink-0" />
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                {statusFilterOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className=" space-y-4">
          {filteredOrders.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground text-sm">
              No change orders found
            </div>
          ) : (
            filteredOrders.map((o, index) => (
              <motion.div
                key={o.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.02 * index }}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-white border border-gray-100 shadow-sm"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-foreground">
                        {o.customerName}
                      </h4>
                      <p className="text-sm text-muted-foreground">{o.company}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleStatusClick(o)}
                      className={cn(
                        'px-3 py-1 rounded-sm text-xs font-medium shrink-0 cursor-pointer transition-opacity hover:opacity-80',
                        o.status === 'Approved'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-amber-100 text-amber-700'
                      )}
                    >
                      {o.status}
                    </button>
                  </div>
                  <div className="flex flex-wrap items-start justify-between mr-16 gap-4 my-3 mt-3">
                    <div>
                      <span className="text-sm text-accent block">
                        Original Cost
                      </span>
                      <span className="text-base font-bold mt-1">
                        {formatCurrency(o.originalCost)}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm text-accent block">
                        Additional Cost
                      </span>
                      <span className="text-base font-bold text-amber-600 mt-1">
                        +{formatCurrency(o.additionalCost)}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm text-accent block">
                        New Total
                      </span>
                      <span className="text-base font-bold text-emerald-600 mt-1">
                        {formatCurrency(o.newTotal)}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm text-accent block">
                        Request Date
                      </span>
                      <span className="text-base font-bold mt-1">{o.requestDate}</span>
                    </div>



                  </div>
                  <div className="flex items-center justify-end gap-2 shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDownloadPdf(o)}
                      className="border-red-200 text-red-600 hover:bg-red-50"
                    >
                      <FileDown className="h-4 w-4 mr-1" />
                      Download PDF
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleViewDetails(o)}
                      className="border-gray-200 text-slate-600 hover:bg-gray-100"
                    >
                      View details
                    </Button>
                  </div>
                </div>

              </motion.div>
            ))
          )}
        </div>
      </div>

      <ViewChangeOrderDetailsModal
        open={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false)
          setSelectedOrder(null)
        }}
        order={selectedOrder}
        onStatusUpdate={handleStatusUpdate}
      />

      <UpdateStatusModal
        open={isStatusModalOpen}
        onClose={() => {
          setIsStatusModalOpen(false)
          setOrderForStatusUpdate(null)
        }}
        order={orderForStatusUpdate}
        onUpdate={handleStatusUpdate}
      />
    </motion.div>
  )
}
