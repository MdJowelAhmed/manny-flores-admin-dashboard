import { useTranslation } from 'react-i18next'
import { ModalWrapper } from '@/components/common'
import { Button } from '@/components/ui/button'
import type {
  CompanyProjectApiDoc,
  CompanyProjectTaskApiDoc,
} from '@/redux/api/companyProjectApi'
import { cn } from '@/utils/cn'
import {
  formatTaskDeadline,
  getTaskPriorityClass,
} from '../companyProjectsUi'

interface TaskDetailsModalProps {
  open: boolean
  onClose: () => void
  project: CompanyProjectApiDoc | null
  task: CompanyProjectTaskApiDoc | null
  onEdit?: (task: CompanyProjectTaskApiDoc) => void
  onDelete?: (task: CompanyProjectTaskApiDoc) => void
}

function DetailLine({
  label,
  value,
  valueClassName,
}: {
  label: string
  value: React.ReactNode
  valueClassName?: string
}) {
  return (
    <div className="grid grid-cols-[140px_12px_1fr] gap-y-1 items-start py-2.5 border-b border-gray-50 last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm text-muted-foreground">:</span>
      <span className={cn('text-sm text-foreground', valueClassName)}>{value}</span>
    </div>
  )
}

export function TaskDetailsModal({
  open,
  onClose,
  project,
  task,
  onEdit,
  onDelete,
}: TaskDetailsModalProps) {
  const { t } = useTranslation()
  if (!task) return null

  const employeeNames =
    task.employees?.map((e) => e.name).join(', ') ||
    task.employeeIds?.join(', ') ||
    '—'

  return (
    <ModalWrapper
      open={open}
      onClose={onClose}
      title={t('companyProjects.taskDetails')}
      size="md"
      className="max-w-lg bg-white"
      footer={
        <div className="grid grid-cols-2 gap-3">
          <Button
            type="button"
            className="bg-primary hover:bg-primary/90 text-white h-11"
            onClick={() => {
              onEdit?.(task)
              onClose()
            }}
          >
            {t('common.edit')}
          </Button>
          <Button
            type="button"
            variant="destructive"
            className="h-11"
            onClick={() => {
              onDelete?.(task)
              onClose()
            }}
          >
            {t('common.delete')}
          </Button>
        </div>
      }
    >
      <div className="py-1">
        <DetailLine
          label={t('companyProjects.projectName')}
          value={project?.projectName ?? '—'}
        />
        <DetailLine label={t('companyProjects.taskName')} value={task.taskName} />
        <DetailLine
          label={t('companyProjects.assignEmployee')}
          value={
            <span className="text-sky-600 underline underline-offset-2">
              {employeeNames}
            </span>
          }
        />
        <DetailLine
          label={t('companyProjects.deadline')}
          value={formatTaskDeadline(task.deadline)}
        />
        <DetailLine
          label={t('companyProjects.priority')}
          value={task.priority}
          valueClassName={getTaskPriorityClass(task.priority)}
        />
        <DetailLine
          label={t('common.description')}
          value={task.description || '—'}
          valueClassName="leading-relaxed"
        />
      </div>
    </ModalWrapper>
  )
}
