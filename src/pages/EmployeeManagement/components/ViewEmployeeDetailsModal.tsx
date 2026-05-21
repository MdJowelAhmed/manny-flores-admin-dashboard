import { ModalWrapper } from '@/components/common'
import { Button } from '@/components/ui/button'
import type { Employee } from '@/types'
import { cn } from '@/utils/cn'
import moment from 'moment'

interface ViewEmployeeDetailsModalProps {
  open: boolean
  onClose: () => void
  employee: Employee | null
  onEdit: () => void
}

function DetailRow({
  label,
  value,
  statusColor,
}: {
  label: string
  value: string | number
  statusColor?: string
}) {
  return (
    <div className="flex justify-between items-center py-2.5 px-4 bg-white rounded-md ">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className={cn('text-sm font-medium text-foreground', statusColor)}>{value}</span>
    </div>
  )
}

function ProjectDetailCard({
  index,
  projectName,
  task,
  deadline,
  status,
}: {
  index: number
  projectName: string
  task: string
  deadline: string
  status: string
}) {
  const isActive = status === 'Active'
  return (
    <div className="space-y-2 p-4 bg-white rounded-lg border">
      <h4 className="text-sm font-semibold text-foreground mb-3">
        {index}. {projectName}
      </h4>
      <DetailRow label="Task" value={task} />
      <DetailRow label="Deadline" value={deadline} />
      <DetailRow
        label="Status"
        value={status}
        statusColor={isActive ? 'text-green-600 font-medium' : 'text-blue-600 font-medium'}
      />
    </div>
  )
}

export function ViewEmployeeDetailsModal({
  open,
  onClose,
  employee,
  onEdit,
}: ViewEmployeeDetailsModalProps) {
  if (!employee) return null

  return (
    <ModalWrapper
      open={open}
      onClose={onClose}
      title="Employee Details"
      size="lg"
      className="max-w-xl bg-secondary-foreground rounded-xl"
    >
      <div className="space-y-6">
        {/* Basic Information */}
        <div className="p-4 bg-white rounded-lg space-y-2">
          <h3 className="text-sm font-bold text-foreground mb-3">Basic Information</h3>
          <DetailRow label="Full Name" value={employee.fullName} />
          <DetailRow label="Employee ID" value={employee.employeeId} />
          <DetailRow label="Email" value={employee.email} />
        </div>

        {/* Organizational Details */}
        <div className="p-4 bg-white rounded-lg space-y-2">
          <h3 className="text-sm font-bold text-foreground mb-3">Organizational Details</h3>
          <DetailRow label="Joining Date" value={employee.joiningDate ? moment(employee.joiningDate).format('DD MMM, YYYY') : '-'} />
          <DetailRow label="Department" value={employee.department} />
          <DetailRow label="Role" value={employee.role} />
          <DetailRow label="Work Schedule" value={employee.workSchedule ? moment(employee.workSchedule).format('DD MMM, YYYY') : 'N/A'} />
        </div>

        {/* Project Details */}
        {employee.projects && employee.projects.length > 0 && (
          <div className="space-y-4 bg-white rounded-lg p-4">
            <h3 className="text-sm font-bold text-foreground">Project Details</h3>
            <div className="space-y-6 b">
              {employee.projects.map((proj, idx) => (
                <ProjectDetailCard
                  key={proj.id}
                  index={idx + 1}
                  projectName={proj.projectName}
                  task={proj.task}
                  deadline={proj.deadline}
                  status={proj.status}
                />
              ))}
            </div>
          </div>
        )}

        <div className="pt-4 border-t border-gray-200">
          <Button
            onClick={onEdit}
            className="w-full bg-primary hover:bg-primary/90 text-white py-3 rounded-lg font-medium"
          >
            Edit
          </Button>
        </div>
      </div>
    </ModalWrapper>
  )
}
