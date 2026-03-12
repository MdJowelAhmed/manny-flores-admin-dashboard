import { ModalWrapper } from '@/components/common'
import { Button } from '@/components/ui/button'
import type { PayrollRecord } from '../payrollData'
import { formatCurrency } from '@/utils/formatters'

interface PaymentDetailsModalProps {
  open: boolean
  onClose: () => void
  record: PayrollRecord | null
  onEdit: () => void
  onDelete: () => void
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center py-2.5 gap-4">
      <span className="text-sm font-medium text-slate-600">{label}:</span>
      <span className="text-sm font-medium text-slate-800">{value}</span>
    </div>
  )
}

export function PaymentDetailsModal({
  open,
  onClose,
  record,
  onEdit,
  onDelete,
}: PaymentDetailsModalProps) {
  if (!record) return null

  const totalAmount = record.amount + record.overtime

  return (
    <ModalWrapper
      open={open}
      onClose={onClose}
      title="Payment Details"
      size="md"
      className="max-w-lg bg-white rounded-xl"
    >
      <div className="space-y-1">
        <DetailRow label="Employee Name" value={record.name} />
        <DetailRow label="ID" value={record.payrollId} />
        <DetailRow label="Project" value={record.project} />
        <DetailRow label="Pay Type" value={record.payType} />
        <DetailRow label="Overtime" value={formatCurrency(record.overtime)} />
        <DetailRow label="Total Amount" value={formatCurrency(totalAmount)} />
      </div>

      <div className="flex items-center justify-center gap-4 pt-6 mt-4 border-t border-gray-100">
        <Button
          onClick={onEdit}
          className="bg-primary hover:bg-primary/90 text-white px-6 rounded-lg"
        >
          Edit
        </Button>
        <Button
          variant="destructive"
          onClick={onDelete}
          className="bg-destructive hover:bg-destructive/90 text-white px-6 rounded-lg"
        >
          Delete
        </Button>
      </div>
    </ModalWrapper>
  )
}
