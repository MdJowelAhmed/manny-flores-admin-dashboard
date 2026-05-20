import { FileText } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { ModalWrapper } from '@/components/common'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import type { Project } from '@/types'
import { formatCurrency } from '@/utils/formatters'
import type { ProjectLineItem } from '@/types'
import { cn } from '@/utils/cn'

interface ViewProjectDetailsModalProps {
  open: boolean
  onClose: () => void
  project: Project | null
}

function DetailRow({ label, value, highlight }: { label: string; value: string | number; highlight?: boolean }) {
  return (
    <div className="flex justify-between py-2">
      <span className="text-sm text-muted-foreground">{label}:</span>
      <span className={cn('text-sm font-medium', highlight && 'text-orange-600')}>{value}</span>
    </div>
  )
}

function ResourceGroup({
  title,
  items,
  t,
}: {
  title: string
  items: ProjectLineItem[]
  t: (key: string) => string
}) {
  if (items.length === 0) return null
  return (
    <div className="pl-8 mb-4 space-y-2">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{title}</p>
      <ul className="space-y-1.5">
        {items.map((item) => (
          <li key={item.id} className="flex justify-between gap-4 text-sm">
            <span className="text-foreground">{item.name}</span>
            <span className="text-muted-foreground tabular-nums shrink-0">
              {item.lineType === 'vehicle'
                ? formatCurrency(item.unitPrice)
                : `${item.quantity} × ${formatCurrency(item.unitPrice)}`}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function ViewProjectDetailsModal({ open, onClose, project }: ViewProjectDetailsModalProps) {
  const { t } = useTranslation()
  if (!project) return null

  return (
    <ModalWrapper
      open={open}
      onClose={onClose}
      title={project.projectName}
      size="lg"
      className="max-w-xl bg-white"
    >
      <div className="space-y-6">
        <p className="text-sm text-muted-foreground -mt-2">{project.category}</p>

        {/* Project Information - Customer */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 rounded bg-primary/10">
              <FileText className="h-4 w-4 text-primary" />
            </div>
            <h3 className="text-sm font-semibold text-foreground">{t('companyProjects.projectInformation')}</h3>
          </div>
          <div className="space-y-1 pl-8">
            <DetailRow label={t('companyProjects.customer')} value={project.customer} />
            <DetailRow label={t('common.email')} value={project.email} />
            <DetailRow label={t('companyProjects.company')} value={project.company} />
          </div>
        </div>

        <Separator />

        {/* Project Information - Details */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 rounded bg-primary/10">
              <FileText className="h-4 w-4 text-primary" />
            </div>
            <h3 className="text-sm font-semibold text-foreground">{t('companyProjects.projectDetails')}</h3>
          </div>
          <div className="space-y-1 pl-8">
            <DetailRow label={t('companyProjects.projectName')} value={project.projectName} />
            <DetailRow label={t('companyProjects.startDate')} value={project.startDate} />
            <DetailRow label={t('companyProjects.totalBudget')} value={formatCurrency(project.totalBudget)} />
            <DetailRow label={t('companyProjects.amountSpent')} value={formatCurrency(project.amountSpent)} highlight />
            <DetailRow label={t('common.duration')} value={project.duration} />
            <DetailRow label={t('companyProjects.remaining')} value={formatCurrency(project.remaining)} />
          </div>
        </div>

        {project.lineItems && project.lineItems.length > 0 && (
          <>
            <Separator />
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1.5 rounded bg-primary/10">
                  <FileText className="h-4 w-4 text-primary" />
                </div>
                <h3 className="text-sm font-semibold text-foreground">
                  {t('companyProjects.resourcesSection')}
                </h3>
              </div>
              <ResourceGroup
                title={t('estimate.material')}
                items={project.lineItems.filter((i) => i.lineType === 'material')}
                t={t}
              />
              <ResourceGroup
                title={t('estimate.equipment')}
                items={project.lineItems.filter((i) => i.lineType === 'equipment')}
                t={t}
              />
              <ResourceGroup
                title={t('estimate.vehicle')}
                items={project.lineItems.filter((i) => i.lineType === 'vehicle')}
                t={t}
              />
            </div>
          </>
        )}

        {project.description && (
          <>
            <Separator />
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1.5 rounded bg-primary/10">
                  <FileText className="h-4 w-4 text-primary" />
                </div>
                <h3 className="text-sm font-semibold text-foreground">{t('common.description')}</h3>
              </div>
              <p className="text-sm text-muted-foreground pl-8 leading-relaxed">{project.description}</p>
            </div>
          </>
        )}

        <div className="flex justify-end pt-4 border-t">
          <Button onClick={onClose} className="bg-primary hover:bg-primary/90 text-white">
            {t('common.close')}
          </Button>
        </div>
      </div>
    </ModalWrapper>
  )
}
