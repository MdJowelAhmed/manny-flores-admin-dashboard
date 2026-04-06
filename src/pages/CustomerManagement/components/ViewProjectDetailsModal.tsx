import { Shield } from 'lucide-react'
import { ModalWrapper } from '@/components/common'
import type { CustomerProject } from '@/types'
import { formatCurrency } from '@/utils/formatters'
import { cn } from '@/utils/cn'
import { useTranslation } from 'react-i18next'

interface ViewProjectDetailsModalProps {
  open: boolean
  onClose: () => void
  project: CustomerProject | null
  /** When true, show read-only notice for client viewers */
  isClientMode?: boolean
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
      <span className="text-sm font-medium text-foreground text-right">{value}</span>
    </div>
  )
}

export function ViewProjectDetailsModal({
  open,
  onClose,
  project,
  isClientMode = false,
}: ViewProjectDetailsModalProps) {
  const { t } = useTranslation()

  if (!project) return null

  return (
    <ModalWrapper
      open={open}
      onClose={onClose}
      title={`${t('customerManagement.project')} #${project.id}`}
      size="md"
      className="max-w-xl bg-white"
    >
      <div className="space-y-4">
        {isClientMode && (
          <div
            className={cn(
              'flex gap-3 rounded-lg border border-amber-200/80 bg-amber-50 px-4 py-3 text-sm text-amber-950'
            )}
          >
            <Shield
              className="h-5 w-5 shrink-0 text-amber-700 mt-0.5"
              aria-hidden
            />
            <p className="leading-relaxed">{t('customerManagement.readOnlyNotice')}</p>
          </div>
        )}

        <div className="space-y-1">
          <DetailRow label={t('customerManagement.id')} value={`#${project.id}`} />
          <DetailRow
            label={t('customerManagement.customerName')}
            value={project.customerName}
          />
          <DetailRow label={t('customerManagement.project')} value={project.project} />
          <DetailRow
            label={t('customerManagement.amount')}
            value={formatCurrency(project.amount, 'EUR')}
          />
          <DetailRow
            label={t('customerManagement.projectDates')}
            value={project.projectDate}
          />
        </div>
      </div>
    </ModalWrapper>
  )
}
