import { FileText } from 'lucide-react'
import { ModalWrapper } from '@/components/common'
import { Button } from '@/components/ui/button'
import type { Project } from '@/types'
import { formatCurrency } from '@/utils/formatters'
import { cn } from '@/utils/cn'

interface ViewProjectFinanceModalProps {
  open: boolean
  onClose: () => void
  project: Project | null
}

function DetailRow({
  label,
  value,
  highlight,
}: {
  label: string
  value: string | number
  highlight?: boolean
}) {
  return (
    <div className="flex justify-between py-2 gap-4">
      <span className="text-sm text-muted-foreground">{label}:</span>
      <span className={cn('text-sm font-medium', highlight && 'text-orange-600')}>{value}</span>
    </div>
  )
}

export function ViewProjectFinanceModal({
  open,
  onClose,
  project,
}: ViewProjectFinanceModalProps) {
  if (!project) return null

  return (
    <ModalWrapper
      open={open}
      onClose={onClose}
      title={project.projectName}
      size="lg"
      className="max-w-xl bg-white"
    >
      <div className="space-y-5">
        <p className="text-sm text-muted-foreground -mt-2">{project.category}</p>

        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 rounded bg-primary/10">
              <FileText className="h-4 w-4 text-primary" />
            </div>
            <h3 className="text-sm font-semibold text-primary">Customer Information</h3>
          </div>
          <div className="space-y-1 pl-8">
            <DetailRow label="Customer" value={project.customer} />
            <DetailRow label="Email" value={project.email} />
            <DetailRow label="Company" value={project.company} />
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 rounded bg-primary/10">
              <FileText className="h-4 w-4 text-primary" />
            </div>
            <h3 className="text-sm font-semibold text-primary">Project Information</h3>
          </div>
          <div className="space-y-1 pl-8">
            <DetailRow label="Project Name" value={project.projectName} />
            <DetailRow label="Start Date" value={project.startDate} />
            <DetailRow label="Amount Spent" value={formatCurrency(project.amountSpent)} highlight />
            <DetailRow label="Total Budget" value={formatCurrency(project.totalBudget)} />
            <DetailRow label="Duration" value={project.duration} />
            <DetailRow label="Remaining" value={formatCurrency(project.remaining)} highlight />
          </div>
        </div>

        {project.description && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 rounded bg-primary/10">
                <FileText className="h-4 w-4 text-primary" />
              </div>
              <h3 className="text-sm font-semibold text-primary">Description</h3>
            </div>
            <p className="text-sm text-muted-foreground pl-8 leading-relaxed">
              {project.description}
            </p>
          </div>
        )}

        <div className="flex justify-end pt-4 border-t">
          <Button onClick={onClose} className="bg-primary hover:bg-primary/90 text-white">
            Close
          </Button>
        </div>
      </div>
    </ModalWrapper>
  )
}
