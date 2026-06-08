import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Info, Pencil, Trash2, Truck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { VehicleListItem } from '../vehicleMaintenanceData'
import { formatCurrency, formatDate } from '@/utils/formatters'

interface VehicleTableProps {
  vehicles: VehicleListItem[]
  onView: (vehicle: VehicleListItem) => void
  onEdit: (vehicle: VehicleListItem, e: React.MouseEvent) => void
  onDelete: (vehicle: VehicleListItem) => void
}

function formatOptionalDate(value?: string) {
  return value ? formatDate(value) : '—'
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
      <table className="w-full min-w-[1100px] border-collapse">
        <thead>
          <tr className="bg-secondary-foreground text-slate-800">
            <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide">
              {t('vehicleMaintenance.model')}
            </th>
            <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide">
              {t('vehicleMaintenance.year')}
            </th>
            <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide">
              {t('resourceRequests.type')}
            </th>
            <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide">
              {t('vehicleMaintenance.category')}
            </th>
            <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide">
              {t('vehicleMaintenance.purchaseDate')}
            </th>
            <th className="px-5 py-4 text-right text-xs font-bold uppercase tracking-wide">
              {t('vehicleMaintenance.purchaseCost')}
            </th>
            <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide">
              {t('vehicleMaintenance.insuranceExpiry')}
            </th>
            <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide">
              {t('vehicleMaintenance.lastService')}
            </th>
            <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide">
              {t('vehicleMaintenance.nextService')}
            </th>
            <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide">
              {t('vehicleMaintenance.assignTo')}
            </th>
            <th className="px-5 py-4 text-right text-xs font-bold uppercase tracking-wide">
              {t('common.actions')}
            </th>
          </tr>
        </thead>
        <tbody className="bg-white">
          {vehicles.length === 0 ? (
            <tr>
              <td
                colSpan={11}
                className="px-5 py-10 text-center text-muted-foreground text-sm"
              >
                {t('vehicleMaintenance.noVehiclesFound')}
              </td>
            </tr>
          ) : (
            vehicles.map((vehicle, index) => (
              <motion.tr
                key={vehicle.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.02 * index }}
                className="border-b border-gray-100/80 last:border-0 hover:bg-gray-50/40 transition-colors"
              >
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    <Truck className="h-5 w-5 text-gray-500 shrink-0" />
                    <span className="text-sm font-medium text-slate-800">{vehicle.model}</span>
                  </div>
                </td>
                <td className="px-5 py-4 text-sm text-slate-600 tabular-nums">{vehicle.year}</td>
                <td className="px-5 py-4 text-sm text-slate-600 capitalize">{vehicle.type || '—'}</td>
                <td className="px-5 py-4 text-sm text-slate-600">{vehicle.category || '—'}</td>
                <td className="px-5 py-4 text-sm text-slate-600">
                  {formatOptionalDate(vehicle.purchaseDate)}
                </td>
                <td className="px-5 py-4 text-sm text-slate-700 text-right tabular-nums">
                  {formatCurrency(vehicle.purchaseCost)}
                </td>
                <td className="px-5 py-4 text-sm text-slate-600">
                  {formatOptionalDate(vehicle.insuranceExpires)}
                </td>
                <td className="px-5 py-4 text-sm text-slate-600">
                  {formatOptionalDate(vehicle.maintenanceLastServiceDate)}
                </td>
                <td className="px-5 py-4 text-sm text-slate-600">
                  {formatOptionalDate(vehicle.maintenanceNextServiceDate)}
                </td>
                <td className="px-5 py-4 text-sm text-slate-600">
                  {vehicle.assignedEmployee?.name ?? '—'}
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center justify-end gap-0.5">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => onView(vehicle)}
                      className="h-9 w-9 text-slate-500 hover:bg-gray-100 hover:text-slate-700"
                      aria-label={t('common.viewDetails')}
                    >
                      <Info className="h-5 w-5 stroke-[1.75]" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={(e) => onEdit(vehicle, e)}
                      className="h-9 w-9 text-emerald-600 hover:bg-emerald-50"
                      aria-label={t('common.edit')}
                    >
                      <Pencil className="h-5 w-5 stroke-[1.75]" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => onDelete(vehicle)}
                      className="h-9 w-9 text-red-500 hover:bg-red-50"
                      aria-label={t('common.delete')}
                    >
                      <Trash2 className="h-5 w-5 stroke-[1.75]" />
                    </Button>
                  </div>
                </td>
              </motion.tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
