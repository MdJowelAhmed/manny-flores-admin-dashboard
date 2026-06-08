import { useTranslation } from 'react-i18next'
import { ModalWrapper } from '@/components/common'
import { Button } from '@/components/ui/button'
import type { VehicleListItem } from '../vehicleMaintenanceData'
import { formatCurrency, formatDate } from '@/utils/formatters'

interface ViewVehicleDetailsModalProps {
  open: boolean
  onClose: () => void
  vehicle: VehicleListItem | null
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

function formatOptionalDate(value?: string) {
  return value ? formatDate(value) : '—'
}

export function ViewVehicleDetailsModal({
  open,
  onClose,
  vehicle,
  onEdit,
  onDelete,
}: ViewVehicleDetailsModalProps) {
  const { t } = useTranslation()
  if (!vehicle) return null

  const emp = vehicle.assignedEmployee

  return (
    <ModalWrapper
      open={open}
      onClose={onClose}
      title={t('vehicleMaintenance.vehicle')}
      size="lg"
      className="max-w-xl bg-white rounded-xl"
    >
      <div className="space-y-5">
        <div className="p-4 bg-gray-100 rounded-lg space-y-2">
          <h3 className="text-sm font-bold text-foreground mb-3">
            {t('vehicleMaintenance.basicInformation')}
          </h3>
          <DetailRow label={t('vehicleMaintenance.model')} value={vehicle.model} />
          <DetailRow label={t('vehicleMaintenance.year')} value={vehicle.year} />
          <DetailRow label={t('resourceRequests.type')} value={vehicle.type || '—'} />
          <DetailRow label={t('vehicleMaintenance.category')} value={vehicle.category || '—'} />
          <DetailRow
            label={t('vehicleMaintenance.purchaseDate')}
            value={formatOptionalDate(vehicle.purchaseDate)}
          />
          <DetailRow
            label={t('vehicleMaintenance.purchaseCost')}
            value={formatCurrency(vehicle.purchaseCost)}
          />
          <DetailRow
            label={t('vehicleMaintenance.insuranceExpiry')}
            value={formatOptionalDate(vehicle.insuranceExpires)}
          />
        </div>

        {emp && (
          <div className="p-4 bg-gray-100 rounded-lg space-y-2">
            <h3 className="text-sm font-bold text-foreground mb-3">
              {t('vehicleMaintenance.assignTo')}
            </h3>
            <DetailRow label={t('common.name')} value={emp.name} />
            {emp.email ? <DetailRow label={t('common.email')} value={emp.email} /> : null}
          </div>
        )}

        <div className="p-4 bg-gray-100 rounded-lg space-y-2">
          <h3 className="text-sm font-bold text-foreground mb-3">
            {t('vehicleMaintenance.maintenance')}
          </h3>
          <DetailRow
            label={t('vehicleMaintenance.lastService')}
            value={formatOptionalDate(vehicle.maintenanceLastServiceDate)}
          />
          <DetailRow
            label={t('vehicleMaintenance.nextService')}
            value={formatOptionalDate(vehicle.maintenanceNextServiceDate)}
          />
        </div>

        <div className="flex gap-3 pt-2">
          <Button
            onClick={onEdit}
            className="flex-1 bg-primary hover:bg-primary/90 text-white py-2.5 rounded-lg font-medium"
          >
            {t('common.edit')}
          </Button>
          <Button
            onClick={onDelete}
            variant="destructive"
            className="flex-1 py-2.5 rounded-lg font-medium"
          >
            {t('common.delete')}
          </Button>
        </div>
      </div>
    </ModalWrapper>
  )
}
