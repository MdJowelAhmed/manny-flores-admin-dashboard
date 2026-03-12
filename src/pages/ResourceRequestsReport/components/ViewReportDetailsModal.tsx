import { ModalWrapper } from '@/components/common'
import { Button } from '@/components/ui/button'
import type { ResourceReport } from '../resourceRequestsData'
import { cn } from '@/utils/cn'

interface ViewReportDetailsModalProps {
  open: boolean
  onClose: () => void
  record: ResourceReport | null
}

function DetailRow({
  label,
  value,
  valueHighlight,
}: {
  label: string
  value: string
  valueHighlight?: boolean
}) {
  return (
    <div className="flex justify-between py-2 gap-4">
      <span className="text-sm text-muted-foreground">{label}:</span>
      <span
        className={cn(
          'text-sm font-medium',
          valueHighlight ? 'text-red-600' : 'text-foreground'
        )}
      >
        {value}
      </span>
    </div>
  )
}

export function ViewReportDetailsModal({
  open,
  onClose,
  record,
}: ViewReportDetailsModalProps) {
  if (!record) return null

  return (
    <ModalWrapper
      open={open}
      onClose={onClose}
      title="Report Details"
      size="md"
      className="max-w-2xl bg-white"
    >
      <div className="space-y-5">
        <div>
          <h3 className="text-sm font-semibold mb-3 text-foreground">
            Basic Information
          </h3>
          <div className="space-y-1">
            <DetailRow label="Date" value={record.date} />
            <DetailRow label="Reported by" value={record.reportedBy} />
            <DetailRow label="Item" value={record.item} />
            <DetailRow label="Type" value={record.type} />
            <DetailRow label="Category" value={record.category} />
            <DetailRow
              label="Urgency"
              value={record.urgency}
              valueHighlight={record.urgency === 'High'}
            />
            <DetailRow label="Status" value={record.status} />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button className="bg-primary hover:bg-primary/90 text-white">
            Approved
          </Button>
        </div>
      </div>
    </ModalWrapper>
  )
}
