import { FileText } from 'lucide-react'
import { ModalWrapper } from '@/components/common'
import { Button } from '@/components/ui/button'
import type { ScheduledProject } from '../projectSchedulingData'

interface ViewScheduleDetailsModalProps {
  open: boolean
  onClose: () => void
  schedule: ScheduledProject | null
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-start py-2 gap-4">
      <span className="text-sm text-muted-foreground shrink-0">{label}:</span>
      <span className="text-sm font-medium text-right">{value}</span>
    </div>
  )
}

export function ViewScheduleDetailsModal({
  open,
  onClose,
  schedule,
}: ViewScheduleDetailsModalProps) {
  if (!schedule) return null

  return (
    <ModalWrapper
      open={open}
      onClose={onClose}
      title={schedule.projectTitle}
      size="lg"
      className="max-w-xl bg-white"
    >
      <div className="space-y-5">
        <p className="text-sm text-muted-foreground -mt-2">{schedule.category}</p>

        {/* Project Information - Customer */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 rounded bg-primary/10">
              <FileText className="h-4 w-4 text-primary" />
            </div>
            <h3 className="text-sm font-semibold text-primary">Customer Information</h3>
          </div>
          <div className="space-y-1 pl-8">
            <DetailRow label="Customer Name" value={schedule.customer} />
            <DetailRow label="Email" value={schedule.email} />
            <DetailRow label="Company" value={schedule.company} />
          </div>
        </div>

        {/* Project Information - Details */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 rounded bg-primary/10">
              <FileText className="h-4 w-4 text-primary" />
            </div>
            <h3 className="text-sm font-semibold text-primary">Project Information</h3>
          </div>
          <div className="space-y-1 pl-8">
            <DetailRow label="Project Name" value={schedule.projectTitle} />
            <DetailRow label="Upload Date" value={schedule.uploadDate} />
            <DetailRow label="Team" value={schedule.team} />
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t">
          <Button onClick={onClose} className="bg-primary hover:bg-primary/90 text-white">
            Close
          </Button>
        </div>
      </div>
    </ModalWrapper>
  )
}
