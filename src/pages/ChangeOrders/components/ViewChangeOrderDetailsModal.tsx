import { ModalWrapper } from '@/components/common'
import { Button } from '@/components/ui/button'
import { Calendar, User, Info } from 'lucide-react'
import type { ChangeOrder, ChangeOrderStatus } from '../changeOrdersData'
import { formatCurrency } from '@/utils/formatters'
import { cn } from '@/utils/cn'

interface ViewChangeOrderDetailsModalProps {
  open: boolean
  onClose: () => void
  order: ChangeOrder | null
  onStatusUpdate?: (orderId: string, status: ChangeOrderStatus) => void
}

function DetailRow({
  label,
  value,
  valueHighlight,
}: {
  label: string
  value: string | number
  valueHighlight?: boolean
}) {
  return (
    <div className="flex justify-between py-2 gap-4">
      <span className="text-sm text-muted-foreground">{label}:</span>
      <span
        className={cn(
          'text-sm ',
          valueHighlight ? 'text-amber-600' : 'text-foreground'
        )}
      >
        {typeof value === 'number' ? formatCurrency(value) : value}
      </span>
    </div>
  )
}

function SectionHeader({ icon: Icon, title }: { icon: React.ElementType; title: string }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <div className="p-1.5 rounded bg-primary/10">
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
    </div>
  )
}

export function ViewChangeOrderDetailsModal({
  open,
  onClose,
  order,
  onStatusUpdate,
}: ViewChangeOrderDetailsModalProps) {
  if (!order) return null

  const handleStatusChange = (status: ChangeOrderStatus) => {
    onStatusUpdate?.(order.id, status)
    onClose()
  }

  return (
    <ModalWrapper
      open={open}
      onClose={onClose}
      title={order.orderId}
      description="Complete change order details and approval status"
      size="lg"
      className="max-w-2xl bg-white"
    >
      <div className="space-y-6">
        <div>
          <SectionHeader icon={Calendar} title="Project Information" />
          <div className="space-y-1 pl-9">
            <DetailRow label="Project Name" value={order.projectName} />
            <DetailRow label="Start Date" value={order.projectStartDate} />
            <DetailRow
              label="Amount Spent"
              value={order.amountSpent}
              valueHighlight
            />
            <DetailRow label="Total Budget" value={order.totalBudget} />
            <DetailRow label="Duration" value={order.duration} />
            <DetailRow label="Remaining" value={order.remaining} />
          </div>
        </div>

        <div>
          <SectionHeader icon={User} title="Customer Information" />
          <div className="space-y-1 pl-9">
            <DetailRow label="Customer name" value={order.customerName} />
            <DetailRow label="Email" value={order.email} />
            <DetailRow label="Company" value={order.company} />
          </div>
        </div>

        <div>
          <SectionHeader icon={Info} title="Reason for Change" />
          <p className="text-sm text-muted-foreground pl-9 leading-relaxed">
            {order.reasonForChange}
          </p>
        </div>

        <div className="flex flex-wrap gap-2 pt-4 border-t justify-end">
          <Button
            onClick={() => handleStatusChange('Approved')}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            Approved
          </Button>
        </div>
      </div>
    </ModalWrapper>
  )
}
