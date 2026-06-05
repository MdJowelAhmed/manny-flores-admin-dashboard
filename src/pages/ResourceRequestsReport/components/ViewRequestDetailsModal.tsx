import { useTranslation } from 'react-i18next'
import { ModalWrapper } from '@/components/common'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/common/StatusBadge'
import { formatDateTime } from '@/utils/formatters'
import { cn } from '@/utils/cn'
import type { ResourceRequestStatusUpdate } from '@/redux/api/resouceRequestApi'
import type { ViewableResourceRequest } from '../resourceRequestsData'
import { formatUrgencyLevel, isHighUrgency, isPendingResourceStatus } from '../resourceRequestsData'

interface ViewRequestDetailsModalProps {
  open: boolean
  onClose: () => void
  viewRecord: ViewableResourceRequest | null
  onStatusUpdate?: (id: string, status: ResourceRequestStatusUpdate) => void
  isUpdating?: boolean
}

function DetailRow({
  label,
  value,
  valueHighlight,
}: {
  label: string
  value: string
  valueHighlight?: boolean
}) {
  return (
    <div className="flex justify-between py-2 gap-4">
      <span className="text-sm text-muted-foreground">{label}:</span>
      <span
        className={cn(
          'text-sm font-medium text-right',
          valueHighlight ? 'text-red-600' : 'text-foreground'
        )}
      >
        {value}
      </span>
    </div>
  )
}

export function ViewRequestDetailsModal({
  open,
  onClose,
  viewRecord,
  onStatusUpdate,
  isUpdating = false,
}: ViewRequestDetailsModalProps) {
  const { t } = useTranslation()

  if (!viewRecord) return null

  const { tab, record } = viewRecord
  const isPending = isPendingResourceStatus(record.status)

  const title =
    tab === 'materials'
      ? t('resourceRequests.materialRequestDetails')
      : tab === 'equipment'
        ? t('resourceRequests.equipmentRequestDetails')
        : t('resourceRequests.vehicleRequestDetails')

  return (
    <ModalWrapper open={open} onClose={onClose} title={title} size="md" className="max-w-2xl bg-white">
      <div className="space-y-5">
        <div>
          <h3 className="text-sm font-semibold mb-3 text-foreground">
            {t('resourceRequests.basicInformation')}
          </h3>
          <div className="space-y-1">
            {tab === 'materials' && (
              <>
                <DetailRow label={t('resourceRequests.materialName')} value={record.materialName} />
                <DetailRow
                  label={t('resourceRequests.quantity')}
                  value={String(record.quantityNeeded)}
                />
              </>
            )}
            {tab === 'equipment' && (
              <DetailRow label={t('resourceRequests.equipmentName')} value={record.equipmentName} />
            )}
            {tab === 'vehicles' && (
              <>
                <DetailRow
                  label={t('resourceRequests.vehicleType')}
                  value={record.vehicleType}
                />
                <DetailRow
                  label={t('projectScheduling.project')}
                  value={record.projectName}
                />
              </>
            )}
            <DetailRow
              label={t('resourceRequests.urgency')}
              value={formatUrgencyLevel(record.urgencyLevel)}
              valueHighlight={isHighUrgency(record.urgencyLevel)}
            />
            <DetailRow label={t('resourceRequests.reason')} value={record.reason || '—'} />
            <DetailRow
              label={t('resourceRequests.requestDate')}
              value={formatDateTime(record.createdAt)}
            />
            <div className="flex justify-between items-center py-2 gap-4">
              <span className="text-sm text-muted-foreground">{t('common.status')}:</span>
              <StatusBadge status={record.status} />
            </div>
          </div>
        </div>

        {isPending && onStatusUpdate && (
          <div className="flex gap-3 pt-2">
            <Button
              className="flex-1 bg-primary hover:bg-primary/90 text-white"
              disabled={isUpdating}
              onClick={() => onStatusUpdate(record.id, 'APPROVED')}
            >
              {t('resourceRequests.approve')}
            </Button>
            <Button
              variant="outline"
              className="flex-1 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
              disabled={isUpdating}
              onClick={() => onStatusUpdate(record.id, 'REJECTED')}
            >
              {t('resourceRequests.reject')}
            </Button>
          </div>
        )}
      </div>
    </ModalWrapper>
  )
}
