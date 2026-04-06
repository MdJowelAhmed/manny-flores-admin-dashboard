import { useTranslation } from 'react-i18next'
import { Calendar, FileText } from 'lucide-react'
import { ModalWrapper } from '@/components/common'
import type { ScheduledProject } from '../projectSchedulingData'

interface ViewScheduleDetailsModalProps {
  open: boolean
  onClose: () => void
  schedule: ScheduledProject | null
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-start gap-6 py-2.5 border-b border-gray-100 last:border-0">
      <span className="text-sm text-muted-foreground shrink-0">{label}:</span>
      <span className="text-sm font-medium text-foreground text-right">{value}</span>
    </div>
  )
}

export function ViewScheduleDetailsModal({
  open,
  onClose,
  schedule,
}: ViewScheduleDetailsModalProps) {
  const { t } = useTranslation()
  if (!schedule) return null

  return (
    <ModalWrapper
      open={open}
      onClose={onClose}
      title={schedule.projectTitle}
      size="lg"
      className="max-w-xl bg-white sm:rounded-2xl"
    >
      <div className="space-y-6 px-1 -mt-1">
        <p className="text-sm text-muted-foreground">{schedule.category}</p>

        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 rounded-lg bg-primary/10">
              <FileText className="h-4 w-4 text-primary" />
            </div>
            <h3 className="text-sm font-semibold text-foreground">
              {t('projectScheduling.customerInformation')}
            </h3>
          </div>
          <div className="rounded-xl border border-gray-100 bg-muted/20 px-4">
            <DetailRow label={t('projectScheduling.customerName')} value={schedule.customer} />
            <DetailRow label={t('projectScheduling.email')} value={schedule.email} />
            <DetailRow label={t('projectScheduling.company')} value={schedule.company} />
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 rounded-lg bg-primary/10">
              <Calendar className="h-4 w-4 text-primary" />
            </div>
            <h3 className="text-sm font-semibold text-foreground">
              {t('projectScheduling.projectInformation')}
            </h3>
          </div>
          <div className="rounded-xl border border-gray-100 bg-muted/20 px-4">
            <DetailRow label={t('projectScheduling.projectName')} value={schedule.projectTitle} />
            <DetailRow label={t('projectScheduling.uploadDate')} value={schedule.uploadDate} />
            <DetailRow label={t('projectScheduling.team')} value={schedule.team} />
          </div>
        </div>
      </div>
    </ModalWrapper>
  )
}
