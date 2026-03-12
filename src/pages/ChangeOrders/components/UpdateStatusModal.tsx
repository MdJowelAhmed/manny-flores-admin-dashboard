import { useState, useEffect } from 'react'
import { ModalWrapper } from '@/components/common'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { ChangeOrder, ChangeOrderStatus } from '../changeOrdersData'
import { statusUpdateOptions } from '../changeOrdersData'
import { cn } from '@/utils/cn'

interface UpdateStatusModalProps {
  open: boolean
  onClose: () => void
  order: ChangeOrder | null
  onUpdate: (orderId: string, status: ChangeOrderStatus) => void
}

const STATUS_STYLES: Record<ChangeOrderStatus, string> = {
  Pending: 'bg-amber-100 text-amber-700',
  Approved: 'bg-emerald-100 text-emerald-700',
}

export function UpdateStatusModal({
  open,
  onClose,
  order,
  onUpdate,
}: UpdateStatusModalProps) {
  const [selectedStatus, setSelectedStatus] = useState<ChangeOrderStatus>(
    order?.status ?? 'Pending'
  )

  useEffect(() => {
    if (order) setSelectedStatus(order.status)
  }, [order?.id, order?.status])

  if (!order) return null

  const handleSubmit = () => {
    onUpdate(order.id, selectedStatus)
    onClose()
  }

  return (
    <ModalWrapper
      open={open}
      onClose={onClose}
      title="Update Status"
      description={`Change order ${order.orderId}`}
      size="sm"
      className="max-w-sm bg-white"
    >
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-muted-foreground block mb-2">
            Current Status
          </label>
          <span
            className={cn(
              'inline-flex px-3 py-1.5 rounded-full text-sm font-medium',
              STATUS_STYLES[order.status]
            )}
          >
            {order.status}
          </span>
        </div>

        <div>
          <label className="text-sm font-medium text-muted-foreground block mb-2">
            New Status
          </label>
          <Select
            value={selectedStatus}
            onValueChange={(v) => setSelectedStatus(v as ChangeOrderStatus)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              {statusUpdateOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2 pt-2">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={selectedStatus === order.status}
            className="flex-1 bg-primary hover:bg-primary/90 text-white"
          >
            Update
          </Button>
        </div>
      </div>
    </ModalWrapper>
  )
}
