import { FileText } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { ModalWrapper } from '@/components/common'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { formatCurrency, formatDate } from '@/utils/formatters'
import type { ProjectLineItem } from '@/types'
import { cn } from '@/utils/cn'
import { getProjectDuration, mapPaymentTypeToStatus } from '../CompanyProjects'
import type { CompanyProjectApiDoc } from '@/redux/api/companyProjectApi'
interface ViewProjectDetailsModalProps {
  open: boolean
  onClose: () => void
  project: CompanyProjectApiDoc | null
  employeeNameById: Record<string, string>
}

function DetailRow({
  label,
  value,
  highlight,
  valueClassName,
}: {
  label: string
  value: string | number
  highlight?: boolean
  valueClassName?: string
}) {
  return (
    <div className="grid grid-cols-[140px_12px_1fr] gap-y-1 items-start py-2.5 border-b border-gray-50 last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm text-muted-foreground">:</span>
      <span
        className={cn(
          'text-sm font-medium',
          highlight && 'text-orange-600',
          valueClassName
        )}
      >
        {value}
      </span>
    </div>
  )
}

function ResourceGroup({ title, items }: { title: string; items: ProjectLineItem[] }) {
  if (items.length === 0) return null
  return (
    <div className="pl-8 mb-4 space-y-2">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
        {title}
      </p>
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

export function ViewProjectDetailsModal({
  open,
  onClose,
  project,
  employeeNameById,
}: ViewProjectDetailsModalProps) {
  const { t } = useTranslation()
  if (!project) return null

  const customerName = project.customerName || 'N/A'
  const customerEmail = project.customerEmail || 'N/A'
  const companyName = project.companyName || 'N/A'
  const startDateStr = project.startDate ? formatDate(project.startDate) : 'N/A'
  const endDateStr = project.endDate ? formatDate(project.endDate) : 'N/A'
  const uiStatus = mapPaymentTypeToStatus(project.paymentType)

  const budget = project.totalBudget || 0
  const remaining = project.amountDue ?? 0
  const spent = Math.max(0, budget - remaining)

  const teamMembers = (project.teamIds ?? [])
    .map((id) => employeeNameById[id] ?? id.slice(0, 8))
    .join(', ')

  const lineItems = (project as CompanyProjectApiDoc & { lineItems?: ProjectLineItem[] })
    .lineItems

  return (
    <ModalWrapper
      open={open}
      onClose={onClose}
      title={t('companyProjects.projectDetails')}
      size="lg"
      className="max-w-xl bg-white"
      footer={
        <div className="flex justify-end">
          <Button onClick={onClose} className="bg-primary hover:bg-primary/90 text-white h-11 px-8">
            {t('common.close')}
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        <p className="text-sm font-semibold text-foreground -mt-1">{project.projectName}</p>
        <p className="text-sm text-muted-foreground -mt-4">{companyName}</p>

        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 rounded bg-primary/10">
              <FileText className="h-4 w-4 text-primary" />
            </div>
            <h3 className="text-sm font-semibold text-foreground">
              {t('companyProjects.customerContact')}
            </h3>
          </div>
          <div className="pl-2">
            <DetailRow label={t('companyProjects.customer')} value={customerName} />
            <DetailRow label={t('common.email')} value={customerEmail} />
          </div>
        </div>

        <Separator />

        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 rounded bg-primary/10">
              <FileText className="h-4 w-4 text-primary" />
            </div>
            <h3 className="text-sm font-semibold text-foreground">
              {t('companyProjects.projectInformation')}
            </h3>
          </div>
          <div className="pl-2">
            <DetailRow label={t('companyProjects.company')} value={companyName} />
            <DetailRow label={t('common.status')} value={uiStatus} />
            <DetailRow label={t('companyProjects.paymentMethod')} value={project.paymentMethod} />
            <DetailRow label={t('companyProjects.startDate')} value={startDateStr} />
            <DetailRow label={t('companyProjects.endDate')} value={endDateStr} />
            <DetailRow
              label={t('common.duration')}
              value={getProjectDuration(project.startDate, project.endDate)}
            />
            <DetailRow label={t('companyProjects.totalBudget')} value={formatCurrency(budget)} />
            <DetailRow
              label={t('companyProjects.amountDue')}
              value={formatCurrency(remaining)}
              highlight
            />
            <DetailRow label={t('companyProjects.amountSpent')} value={formatCurrency(spent)} />
            <DetailRow
              label={t('companyProjects.assignedTeam')}
              value={teamMembers || t('companyProjects.noTeamAssigned')}
            />
          </div>
        </div>

        {lineItems && lineItems.length > 0 && (
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
                items={lineItems.filter((i) => i.lineType === 'material')}
              />
              <ResourceGroup
                title={t('estimate.equipment')}
                items={lineItems.filter((i) => i.lineType === 'equipment')}
              />
              <ResourceGroup
                title={t('estimate.vehicle')}
                items={lineItems.filter((i) => i.lineType === 'vehicle')}
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
