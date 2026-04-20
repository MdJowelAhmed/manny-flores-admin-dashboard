import { ModalWrapper } from '@/components/common'
import { Button } from '@/components/ui/button'
import type { Vehicle } from '@/types'
import { cn } from '@/utils/cn'

interface ViewVehicleDetailsModalProps {
  open: boolean
  onClose: () => void
  vehicle: Vehicle | null
  onEdit: () => void
  onDelete: () => void
}

function DetailRow({
  label,
  value,
  highlight,
}: {
  label: string
  value: string | number
  highlight?: boolean
}) {
  return (
    <div className="flex justify-between items-center py-2.5 px-4 bg-gray-100 rounded-md">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span
        className={cn(
          'text-sm font-medium text-foreground',
          highlight && 'text-green-600 font-semibold'
        )}
      >
        {value}
      </span>
    </div>
  )
}

export function ViewVehicleDetailsModal({
  open,
  onClose,
  vehicle,
  onEdit,
  onDelete,
}: ViewVehicleDetailsModalProps) {
  if (!vehicle) return null
  const emp = vehicle.assignedEmployee

  return (
    <ModalWrapper
      open={open}
      onClose={onClose}
      title="Vehicles Details"
      size="lg"
      className="max-w-xl bg-white rounded-xl"
    >
      <div className="space-y-5">
        <div className="p-4 bg-gray-100 rounded-lg space-y-2">
          <h3 className="text-sm font-bold text-foreground mb-3">Basic Information</h3>
          <DetailRow label="Model" value={vehicle.model} />
          <DetailRow label="Year" value={vehicle.year} />
          <DetailRow label="Category" value={vehicle.category} />
          <DetailRow label="Type" value={vehicle.type} />
          <DetailRow label="Purchase Date" value={vehicle.purchaseDate} />
          <DetailRow label="Purchase Cost" value={vehicle.purchaseCost} />
          <DetailRow label="Insurance Expiry" value={vehicle.insuranceExpiry} />
        </div>

        {emp && (
          <div className="p-4 bg-gray-100 rounded-lg space-y-2">
            <h3 className="text-sm font-bold text-foreground mb-3">Assigned Employee</h3>
            <DetailRow label="Name" value={emp.name} />
            <DetailRow label="Project" value={emp.project} />
            <DetailRow label="Start date" value={emp.startDate} />
            <DetailRow label="Location" value={emp.location} />
          </div>
        )}

        <div className="p-4 bg-gray-100 rounded-lg space-y-2">
          <h3 className="text-sm font-bold text-foreground mb-3">Maintenance</h3>
          <DetailRow label="Last Service" value={vehicle.lastService} />
          <DetailRow label="Next Service" value={vehicle.nextService} highlight />
        </div>

        <div className="flex gap-3 pt-2">
          <Button
            onClick={onEdit}
            className="flex-1 bg-primary hover:bg-primary/90 text-white py-2.5 rounded-lg font-medium"
          >
            Edit
          </Button>
          <Button
            onClick={onDelete}
            variant="destructive"
            className="flex-1 py-2.5 rounded-lg font-medium"
          >
            Delete
          </Button>
        </div>
      </div>
    </ModalWrapper>
  )
}
