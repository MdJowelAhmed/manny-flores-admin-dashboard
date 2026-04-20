import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Info, Pencil, Trash2, Truck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/utils/cn'
import type { Vehicle, VehicleStatus } from '@/types'
import { VEHICLE_STATUS_COLORS } from '../vehicleMaintenanceData'

interface VehicleTableProps {
  vehicles: Vehicle[]
  onView: (vehicle: Vehicle) => void
  onEdit: (vehicle: Vehicle, e: React.MouseEvent) => void
  onDelete: (vehicle: Vehicle) => void
}

export function VehicleTable({
  vehicles,
  onView,
  onEdit,
  onDelete,
}: VehicleTableProps) {
  const { t } = useTranslation()
  return (
    <div className="w-full overflow-auto">
      <table className="w-full min-w-[700px]">
        <thead>
          <tr className="bg-secondary-foreground text-accent">
            <th className="px-6 py-4 text-left text-sm font-bold">{t('vehicleMaintenance.vehicle')}</th>
            <th className="px-6 py-4 text-left text-sm font-bold">Category</th>
            <th className="px-6 py-4 text-left text-sm font-bold">{t('resourceRequests.type')}</th>
            <th className="px-6 py-4 text-left text-sm font-bold">{t('vehicleMaintenance.assignTo')}</th>
            <th className="px-6 py-4 text-left text-sm font-bold">{t('vehicleMaintenance.usage')}</th>
            <th className="px-6 py-4 text-left text-sm font-bold">{t('vehicleMaintenance.nextService')}</th>
            <th className="px-6 py-4 text-left text-sm font-bold">{t('common.status')}</th>
            <th className="px-6 py-4 text-right text-sm font-bold">{t('common.actions')}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white">
          {vehicles.length === 0 ? (
            <tr>
              <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                {t('vehicleMaintenance.noVehiclesFound')}
              </td>
            </tr>
          ) : (
            vehicles.map((vehicle, index) => {
              const statusColors =
                VEHICLE_STATUS_COLORS[vehicle.status as VehicleStatus] ?? {
                  bg: 'bg-gray-100',
                  text: 'text-gray-800',
                }
              return (
                <motion.tr
                  key={vehicle.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * index }}
                  className="hover:bg-gray-50 transition-colors shadow-sm"
                >
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-2">
                      <Truck className="h-5 w-5 text-gray-500" />
                      <span className="text-sm font-medium text-slate-800">
                        {vehicle.vehicleName}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-3">
                    <span className="text-sm text-slate-600">{vehicle.category}</span>
                  </td>
                  <td className="px-6 py-3">
                    <span className="text-sm text-slate-600">{vehicle.type}</span>
                  </td>
                  <td className="px-6 py-3">
                    <span className="text-sm text-slate-600">{vehicle.assignedTo}</span>
                  </td>
                  <td className="px-6 py-3">
                    <span className="text-sm text-slate-600">{vehicle.usage}</span>
                  </td>
                  <td className="px-6 py-3">
                    <span className="text-sm text-slate-600">{vehicle.nextService}</span>
                  </td>
                  <td className="px-6 py-3">
                    <span
                      className={cn(
                        'inline-flex px-3 py-1 rounded text-xs font-medium',
                        statusColors.text
                      )}
                    >
                      {vehicle.status}
                    </span>
                  </td>
                  <td className="px-6 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="outline"
                        size="icon-sm"
                        onClick={() => onView(vehicle)}
                        className="h-8 w-8 border-none text-blue-500 hover:bg-blue-50"
                      >
                        <Info className="h-5 w-5" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon-sm"
                        onClick={(e) => onEdit(vehicle, e)}
                        className="h-8 w-8 border-none text-green-500 hover:bg-green-50"
                      >
                        <Pencil className="h-5 w-5" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon-sm"
                        onClick={() => onDelete(vehicle)}
                        className="h-8 w-8 border-none text-red-500 hover:bg-red-50"
                      >
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    </div>
                  </td>
                </motion.tr>
              )
            })
          )}
        </tbody>
      </table>
    </div>
  )
}
