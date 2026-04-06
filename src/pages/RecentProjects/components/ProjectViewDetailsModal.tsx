import { Briefcase, Download, FileText, Info } from 'lucide-react'
import { ModalWrapper } from '@/components/common'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import type { RecentProject } from '../recentProjectsData'
import { cn } from '@/utils/cn'
import { formatProjectDetailDate } from '../formatProjectDates'
import { downloadProjectPlanFile } from '../downloadPlanFile'
import { useTranslation } from 'react-i18next'

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
    <div className="flex justify-between gap-4 py-2">
      <span className="text-sm text-muted-foreground shrink-0">{label}:</span>
      <span className="text-sm font-medium text-right">{value}</span>
    </div>
  )
}

export function ProjectViewDetailsModal({
  open,
  onClose,
  project,
}: ProjectViewDetailsModalProps) {
  const { t } = useTranslation()

  if (!project) return null

  const projectName = project.projectName || project.project
  const company = project.company || project.project
  const plans = project.planFiles ?? []

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

        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 rounded bg-green-100">
              <FileText className="h-4 w-4 text-green-600" />
            </div>
            <h3 className="text-sm font-semibold text-foreground">
              {t('projectDetailsModal.customerInformation')}
            </h3>
          </div>
          <div className="space-y-1 pl-8">
            <DetailRow
              label={t('projectDetailsModal.customerName')}
              value={project.customerName}
            />
            <DetailRow label={t('projectDetailsModal.email')} value={project.email || '-'} />
            <DetailRow label={t('projectDetailsModal.company')} value={company} />
          </div>
        </div>

        <Separator />

        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 rounded bg-green-100">
              <FileText className="h-4 w-4 text-green-600" />
            </div>
            <h3 className="text-sm font-semibold text-foreground">
              {t('projectDetailsModal.projectInformation')}
            </h3>
          </div>
          <div className="space-y-1 pl-8">
            <DetailRow label={t('projectDetailsModal.projectName')} value={projectName} />
            <DetailRow label={t('projectDetailsModal.totalBudget')} value={project.value} />
            <DetailRow
              label={t('projectDetailsModal.startDate')}
              value={formatProjectDetailDate(project.startDate)}
            />
            <DetailRow
              label={t('projectDetailsModal.endDate')}
              value={formatProjectDetailDate(project.endDate)}
            />
            <DetailRow
              label={t('projectDetailsModal.progress')}
              value={
                project.status === 'Completed'
                  ? t('recentProjectsPage.completed')
                  : `${project.progress}%`
              }
            />
          </div>
        </div>

        <Separator />

        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 rounded bg-green-100">
              <Briefcase className="h-4 w-4 text-green-600" />
            </div>
            <h3 className="text-sm font-semibold text-foreground">
              {t('projectDetailsModal.projectPlan')}
            </h3>
          </div>
          {plans.length === 0 ? (
            <p className="text-sm text-muted-foreground pl-8">
              {t('projectDetailsModal.noPlansYet')}
            </p>
          ) : (
            <div className="space-y-2 pl-8">
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-gray-200 bg-gray-50/80 px-3 py-2.5"
                >
                  <span className="text-sm font-medium text-foreground truncate min-w-0">
                    {plan.name}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="shrink-0 text-gray-500 hover:text-gray-800"
                    aria-label={t('projectDetailsModal.downloadPlan')}
                    onClick={() => downloadProjectPlanFile(plan)}
                  >
                    <Download className="h-5 w-5" />
                  </Button>
                </div>
              ))}
            </div>
          )}
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
                  {t('projectDetailsModal.description')}
                </h3>
              </div>
              <p className="text-sm text-muted-foreground pl-8 leading-relaxed">
                {project.description}
              </p>
            </div>
          </>
        )}
      </div>
    </ModalWrapper>
  )
}
