import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Info, Pencil, Trash2, Wrench } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/utils/cn'
import type { Equipment, EquipmentStatus } from '@/types'
import { EQUIPMENT_STATUS_COLORS } from '../equipmentMaintenanceData'

interface EquipmentTableProps {
  equipment: Equipment[]
  onView: (equipment: Equipment) => void
  onEdit: (equipment: Equipment, e: React.MouseEvent) => void
  onDelete: (equipment: Equipment) => void
}

export function EquipmentTable({
  equipment,
  onView,
  onEdit,
  onDelete,
}: EquipmentTableProps) {
  const { t } = useTranslation()
  return (
    <div className="w-full overflow-auto">
      <table className="w-full min-w-[700px]">
        <thead>
          <tr className="bg-secondary-foreground text-accent">
            <th className="px-6 py-4 text-left text-sm font-bold">{t('equipmentMaintenance.equipment')}</th>
            <th className="px-6 py-4 text-left text-sm font-bold">{t('resourceRequests.type')}</th>
            <th className="px-6 py-4 text-left text-sm font-bold">{t('equipmentMaintenance.assignTo')}</th>
            <th className="px-6 py-4 text-left text-sm font-bold">{t('equipmentMaintenance.usage')}</th>
            <th className="px-6 py-4 text-left text-sm font-bold">{t('equipmentMaintenance.nextService')}</th>
            <th className="px-6 py-4 text-left text-sm font-bold">{t('common.status')}</th>
            <th className="px-6 py-4 text-right text-sm font-bold">{t('common.actions')}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white">
          {equipment.length === 0 ? (
            <tr>
              <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                {t('equipmentMaintenance.noEquipmentFound')}
              </td>
            </tr>
          ) : (
            equipment.map((item, index) => {
              const statusColors =
                EQUIPMENT_STATUS_COLORS[item.status as EquipmentStatus] ?? {
                  bg: 'bg-gray-100',
                  text: 'text-gray-800',
                }
              return (
                <motion.tr
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * index }}
                  className="hover:bg-gray-50 transition-colors shadow-sm"
                >
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-2">
                      <Wrench className="h-5 w-5 text-gray-500" />
                      <span className="text-sm font-medium text-slate-800">
                        {item.equipmentName}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-3">
                    <span className="text-sm text-slate-600">{item.type}</span>
                  </td>
                  <td className="px-6 py-3">
                    <span className="text-sm text-slate-600">{item.assignedTo}</span>
                  </td>
                  <td className="px-6 py-3">
                    <span className="text-sm text-slate-600">{item.usage}</span>
                  </td>
                  <td className="px-6 py-3">
                    <span className="text-sm text-slate-600">{item.nextService}</span>
                  </td>
                  <td className="px-6 py-3">
                    <span
                      className={cn(
                        'inline-flex px-3 py-1 rounded text-xs font-medium',
                        statusColors.text
                      )}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="outline"
                        size="icon-sm"
                        onClick={() => onView(item)}
                        className="h-8 w-8 border-none text-blue-500 hover:bg-blue-50"
                      >
                        <Info className="h-5 w-5" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon-sm"
                        onClick={(e) => onEdit(item, e)}
                        className="h-8 w-8 border-none text-green-500 hover:bg-green-50"
                      >
                        <Pencil className="h-5 w-5" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon-sm"
                        onClick={() => onDelete(item)}
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
