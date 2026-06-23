import { ModalWrapper } from '@/components/common'
import { Button } from '@/components/ui/button'
import type { Employee } from '@/types'
import moment from 'moment'
import { useTranslation } from 'react-i18next'

interface ViewBuilderDetailsModalProps {
  open: boolean
  onClose: () => void
  builder: Employee | null
  onEdit: () => void
}

function DetailRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex justify-between items-center py-2.5 px-4 bg-white rounded-md">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-foreground">{value}</span>
    </div>
  )
}

export function ViewBuilderDetailsModal({
  open,
  onClose,
  builder,
  onEdit,
}: ViewBuilderDetailsModalProps) {
  const { t } = useTranslation()

  if (!builder) return null

  return (
    <ModalWrapper
      open={open}
      onClose={onClose}
      title={t('builderManagement.builderDetails')}
      size="lg"
      className="max-w-xl bg-secondary-foreground rounded-xl"
    >
      <div className="space-y-6">
        <div className="p-4 bg-white rounded-lg space-y-2">
          <h3 className="text-sm font-bold text-foreground mb-3">
            {t('builderManagement.basicInformation')}
          </h3>
          <DetailRow label={t('builderManagement.fullName')} value={builder.fullName} />
          <DetailRow label={t('builderManagement.builderId')} value={builder.employeeId} />
          <DetailRow label={t('common.email')} value={builder.email} />
          {builder.contact && (
            <DetailRow label={t('builderManagement.contact')} value={builder.contact} />
          )}
        </div>

        <div className="p-4 bg-white rounded-lg space-y-2">
          <h3 className="text-sm font-bold text-foreground mb-3">
            {t('builderManagement.organizationalDetails')}
          </h3>
          <DetailRow
            label={t('builderManagement.joiningDate')}
            value={
              builder.joiningDate
                ? moment(builder.joiningDate).format('DD MMM, YYYY')
                : '-'
            }
          />
          <DetailRow label={t('builderManagement.role')} value={builder.role || 'BUILDER'} />
          <DetailRow
            label={t('common.status')}
            value={builder.isBanned ? t('builderManagement.banned') : t('builderManagement.active')}
          />
        </div>

        <div className="pt-4 border-t border-gray-200">
          <Button
            onClick={onEdit}
            className="w-full bg-primary hover:bg-primary/90 text-white py-3 rounded-lg font-medium"
          >
            {t('common.edit')}
          </Button>
        </div>
      </div>
    </ModalWrapper>
  )
}
