import { useTranslation } from 'react-i18next'
import { ModalWrapper } from '@/components/common'
import { Button } from '@/components/ui/button'
import type { EquipmentListItem } from '../equipmentMaintenanceData'
import { formatCurrency, formatDate } from '@/utils/formatters'

interface ViewEquipmentDetailsModalProps {
  open: boolean
  onClose: () => void
  equipment: EquipmentListItem | null
  onEdit: () => void
  onDelete: () => void
}

function DetailRow({
  label,
  value,
}: {
  label: string
  value: string | number
}) {
  return (
    <div className="flex justify-between items-center py-2.5 px-4 bg-gray-100 rounded-md">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-foreground">{value}</span>
    </div>
  )
}

export function ViewEquipmentDetailsModal({
  open,
  onClose,
  equipment,
  onEdit,
  onDelete,
}: ViewEquipmentDetailsModalProps) {
  const { t } = useTranslation()
  if (!equipment) return null

  return (
    <ModalWrapper
      open={open}
      onClose={onClose}
      title={t('equipmentMaintenance.equipment')}
      size="lg"
      className="max-w-xl bg-white rounded-xl"
    >
      <div className="space-y-5">
        <div className="p-4 bg-gray-100 rounded-lg space-y-2">
          <h3 className="text-sm font-bold text-foreground mb-3">
            {t('equipmentMaintenance.basicInformation')}
          </h3>
          <DetailRow label={t('equipmentMaintenance.equipmentName')} value={equipment.equipmentName} />
          <DetailRow label={t('equipmentMaintenance.category')} value={equipment.category || '—'} />
          <DetailRow
            label={t('equipmentMaintenance.purchaseDate')}
            value={equipment.purchaseDate ? formatDate(equipment.purchaseDate) : '—'}
          />
          <DetailRow
            label={t('equipmentMaintenance.purchaseCost')}
            value={formatCurrency(equipment.purchaseCost)}
          />
          <DetailRow
            label={t('equipmentMaintenance.warrantyExpiry')}
            value={
              equipment.warrantyExpiryDate ? formatDate(equipment.warrantyExpiryDate) : '—'
            }
          />
        </div>

        <div className="flex flex-wrap gap-3 pt-2">
          <Button
            onClick={onEdit}
            className="flex-1 min-w-[120px] bg-primary hover:bg-primary/90 text-white py-2.5 rounded-lg font-medium"
          >
            {t('common.edit')}
          </Button>
          <Button
            onClick={onDelete}
            variant="destructive"
            className="flex-1 min-w-[120px] py-2.5 rounded-lg font-medium"
          >
            {t('common.delete')}
          </Button>
        </div>
      </div>
    </ModalWrapper>
  )
}
