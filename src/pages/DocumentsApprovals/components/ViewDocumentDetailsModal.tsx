import { useTranslation } from 'react-i18next'
import { Calendar, Clock, Download } from 'lucide-react'
import { ModalWrapper } from '@/components/common'
import { Button } from '@/components/ui/button'
import type { DocumentEntry } from '../documentsApprovalsData'
import { formatCurrency } from '@/utils/formatters'
import { cn } from '@/utils/cn'
import { toast } from '@/utils/toast'

interface ViewDocumentDetailsModalProps {
  open: boolean
  onClose: () => void
  document: DocumentEntry | null
}

function DetailRow({
  label,
  value,
  valueClassName,
}: {
  label: string
  value: string | number
  valueClassName?: string
}) {
  return (
    <div className="flex justify-between items-start gap-6 py-2.5 border-b border-gray-100 last:border-0">
      <span className="text-sm text-muted-foreground shrink-0">{label}:</span>
      <span className={cn('text-sm font-medium text-foreground text-right', valueClassName)}>
        {typeof value === 'number' ? formatCurrency(value) : value}
      </span>
    </div>
  )
}

export function ViewDocumentDetailsModal({
  open,
  onClose,
  document,
}: ViewDocumentDetailsModalProps) {
  const { t } = useTranslation()
  if (!document) return null

  const statusLabel = t(`documentsApprovals.status.${document.status}`)
  const statusValueClass =
    document.status === 'approved'
      ? 'font-bold text-primary'
      : document.status === 'review'
        ? 'font-medium text-orange-600'
        : document.status === 'signing'
          ? 'font-medium text-purple-600'
          : 'font-medium text-destructive'

  const handleDownloadReport = () => {
    const lines = [
      `${document.projectTitle}`,
      `${t('documentsApprovals.uploadedBy')}: ${document.uploadedBy}`,
      `${t('documentsApprovals.projectName')}: ${document.projectName}`,
      `${t('documentsApprovals.startDate')}: ${document.startDate}`,
      `${t('documentsApprovals.budget')}: ${formatCurrency(document.budgetAmount)}`,
      `${t('documentsApprovals.version')}: ${document.version}`,
      `${t('common.timeline')}: ${document.timeline}`,
      `${t('documentsApprovals.statusLabel')}: ${statusLabel}`,
      '',
      t('documentsApprovals.auditTrail'),
      ...document.auditTrail.map((a) => `${a.title} — ${a.by} • ${a.date}`),
    ]
    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = globalThis.document.createElement('a')
    a.href = url
    a.download = `full-report-${document.id}.txt`
    a.click()
    URL.revokeObjectURL(url)
    toast({
      title: t('common.success'),
      description: t('documentsApprovals.reportDownloaded'),
      variant: 'success',
    })
  }

  return (
    <ModalWrapper
      open={open}
      onClose={onClose}
      title={document.projectTitle}
      size="lg"
      className="max-w-xl bg-white sm:rounded-2xl"
      footer={
        <Button
          type="button"
          className="w-full h-11 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
          onClick={handleDownloadReport}
        >
          <Download className="h-4 w-4" />
          {t('documentsApprovals.fullReport')}
        </Button>
      }
    >
      <div className="space-y-6 -mt-1">
        <p className="text-sm text-muted-foreground">{document.modalSubtitle}</p>

        <div className="rounded-xl border border-gray-100 bg-muted/15 px-4 py-3">
          <DetailRow label={t('documentsApprovals.uploadedBy')} value={document.uploadedBy} />
        </div>

        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 rounded-lg bg-primary/10">
              <Calendar className="h-4 w-4 text-primary" />
            </div>
            <h3 className="text-sm font-semibold text-foreground">
              {t('documentsApprovals.projectInformation')}
            </h3>
          </div>
          <div className="rounded-xl border border-gray-100 bg-muted/20 px-4">
            <DetailRow label={t('documentsApprovals.projectName')} value={document.projectName} />
            <DetailRow label={t('documentsApprovals.startDate')} value={document.startDate} />
            <DetailRow label={t('documentsApprovals.budget')} value={document.budgetAmount} />
            <DetailRow label={t('documentsApprovals.version')} value={document.version} />
            <DetailRow label={t('common.timeline')} value={document.timeline} />
            <DetailRow
              label={t('documentsApprovals.statusLabel')}
              value={statusLabel}
              valueClassName={statusValueClass}
            />
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 rounded-lg bg-primary/10">
              <Clock className="h-4 w-4 text-primary" />
            </div>
            <h3 className="text-sm font-semibold text-foreground">
              {t('documentsApprovals.auditTrailHistory')}
            </h3>
          </div>
          <div className="space-y-4 pl-1">
            {document.auditTrail.map((entry, i) => (
              <div key={`${entry.title}-${i}`} className="rounded-xl border border-gray-100 bg-white px-4 py-3">
                <p className="text-sm font-medium text-foreground">{entry.title}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {t('documentsApprovals.auditByDate', { name: entry.by, date: entry.date })}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ModalWrapper>
  )
}
