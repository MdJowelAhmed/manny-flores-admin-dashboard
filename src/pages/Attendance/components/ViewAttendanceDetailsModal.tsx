import { ModalWrapper } from '@/components/common'
import { Button } from '@/components/ui/button'
import type { AttendanceRecord } from '../attendanceData'
import { STATUS_STYLES } from '../attendanceData'
import { cn } from '@/utils/cn'

interface ViewAttendanceDetailsModalProps {
  open: boolean
  onClose: () => void
  record: AttendanceRecord | null
  onEdit: () => void
  onMarkAbsent: () => void
  onDelete: () => void
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-2 gap-4">
      <span className="text-sm text-muted-foreground">{label}:</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  )
}

export function ViewAttendanceDetailsModal({
  open,
  onClose,
  record,
  onEdit,
  onMarkAbsent,
  onDelete,
}: ViewAttendanceDetailsModalProps) {
  if (!record) return null

  const style = STATUS_STYLES[record.status]

  return (
    <ModalWrapper
      open={open}
      onClose={onClose}
      title="Attendance Details"
      size="md"
      className="max-w-md"
    >
      <div className="space-y-5">
        <div className="space-y-1">
          <DetailRow label="Name" value={record.employee} />
          <DetailRow label="Date" value={record.date} />
          <DetailRow label="Project" value={record.project} />
          <DetailRow label="Check In" value={record.checkIn} />
          <DetailRow label="Check Out" value={record.checkOut} />
          <DetailRow label="Total Hours" value={record.totalHours} />
          <div className="flex justify-between items-center py-2">
            <span className="text-sm text-muted-foreground">Status:</span>
            <span
              className={cn(
                'inline-flex px-3 py-1 rounded-full text-xs font-medium',
                style?.bg ?? 'bg-gray-100',
                style?.text ?? 'text-slate-700'
              )}
            >
              {record.status}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 pt-4 border-t">
          <Button onClick={onEdit} className="bg-primary hover:bg-primary/90 text-white">
            Edit Entry
          </Button>
          <Button variant="outline" onClick={onMarkAbsent} className="bg-gray-100">
            Mark as Absent
          </Button>
          <Button variant="destructive" onClick={onDelete}>
            Delete
          </Button>
        </div>
      </div>
    </ModalWrapper>
  )
}
