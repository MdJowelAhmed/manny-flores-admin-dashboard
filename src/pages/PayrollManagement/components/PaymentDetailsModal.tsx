import { ModalWrapper } from '@/components/common'
import { Button } from '@/components/ui/button'
import type { PayrollEntry } from './PayrollTable'
import { formatCurrency } from '@/utils/formatters'

interface PaymentDetailsModalProps {
  open: boolean
  onClose: () => void
  record: PayrollEntry | null
  onMarkPaid: () => void
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
  onMarkPaid,
  onDelete,
}: PaymentDetailsModalProps) {
  if (!record) return null

  return (
    <ModalWrapper
      open={open}
      onClose={onClose}
      title="Payment Details"
      size="md"
      className="max-w-lg bg-white rounded-xl"
    >
      <div className="space-y-1">
        <DetailRow label="Employee ID" value={record.employee?.id || 'N/A'} />
        <DetailRow label="Employee Name" value={record.employee?.name || 'N/A'} />
        <DetailRow label="Project ID" value={record.projectId || 'N/A'} />
        <DetailRow label="Pay Type" value={record.payType} />
        <DetailRow label="Status" value={record.paymentTypeStatus} />
        <DetailRow label="Salary" value={formatCurrency(record.salary)} />
        <DetailRow label="Working Hours" value={String(record.workingHour)} />
        <DetailRow label="Hourly Rate" value={formatCurrency(record.hourlyRate)} />
        <DetailRow label="Overtime Hours" value={String(record.overTimeHours)} />
        <DetailRow label="Overtime Amount" value={formatCurrency(record.overTimeAmount)} />
        <DetailRow label="Month" value={String(record.month)} />
        <DetailRow label="Year" value={String(record.year)} />
        <DetailRow label="Final Salary" value={formatCurrency(record.finalSalary)} />
      </div>

      <div className="flex items-center justify-center gap-4 pt-6 mt-4 border-t border-gray-100">
        <Button
          onClick={onMarkPaid}
          disabled={record.paymentTypeStatus === 'PAID'}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 rounded-lg disabled:opacity-50"
        >
          Mark as Paid
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
