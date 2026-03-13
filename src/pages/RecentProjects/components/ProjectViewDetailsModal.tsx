import { FileText, Info } from 'lucide-react'
import { ModalWrapper } from '@/components/common'
import { Separator } from '@/components/ui/separator'
import type { RecentProject } from '../recentProjectsData'
import { cn } from '@/utils/cn'

interface ProjectViewDetailsModalProps {
  open: boolean
  onClose: () => void
  project: RecentProject | null
}

function DetailRow({
  label,
  value,
}: {
  label: string
  value: string | number
}) {
  return (
    <div className="flex justify-between py-2">
      <span className="text-sm text-muted-foreground">{label}:</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  )
}

export function ProjectViewDetailsModal({
  open,
  onClose,
  project,
}: ProjectViewDetailsModalProps) {
  if (!project) return null

  const projectName = project.projectName || project.project
  const company = project.company || project.project

  return (
    <ModalWrapper
      open={open}
      onClose={onClose}
      title={projectName}
      size="lg"
      className="max-w-2xl bg-white"
    >
      <div className="space-y-6">
        <p className="text-sm text-muted-foreground -mt-2">{project.project}</p>

        {/* Project Information - Customer */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 rounded bg-green-100">
              <FileText className="h-4 w-4 text-green-600" />
            </div>
            <h3 className="text-sm font-semibold text-foreground">
              Customer Information
            </h3>
          </div>
          <div className="space-y-1 pl-8">
            <DetailRow label="Customer Name" value={project.customerName} />
            <DetailRow label="Email" value={project.email || '-'} />
            <DetailRow label="Company" value={company} />
          </div>
        </div>

        <Separator />

        {/* Project Information - Project specifics */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 rounded bg-green-100">
              <FileText className="h-4 w-4 text-green-600" />
            </div>
            <h3 className="text-sm font-semibold text-foreground">
              Project Information
            </h3>
          </div>
          <div className="space-y-1 pl-8">
            <DetailRow label="Project Name" value={projectName} />
            <DetailRow label="Total Budget" value={project.value} />
            <DetailRow
              label="Progress"
              value={
                project.status === 'Completed'
                  ? 'Completed'
                  : `${project.progress}%`
              }
            />
          </div>
        </div>

        {project.description && (
          <>
            <Separator />
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div
                  className={cn(
                    'p-1.5 rounded-full bg-green-100 flex items-center justify-center'
                  )}
                >
                  <Info className="h-4 w-4 text-green-600" />
                </div>
                <h3 className="text-sm font-semibold text-foreground">
                  Description
                </h3>
              </div>
              <p className="text-sm text-muted-foreground pl-8 leading-relaxed">
                {project.description}
              </p>
            </div>
          </>
        )}

        {/* <div className="flex justify-end pt-4 border-t">
          <Button
            onClick={onClose}
            className="bg-primary hover:bg-primary/90 text-white"
          >
            Close
          </Button>
        </div> */}
      </div>
    </ModalWrapper>
  )
}
