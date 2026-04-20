import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Info, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Material } from '../manageMaterialsData'
import { formatCurrency } from '@/utils/formatters'
import { getAvailableStock, getStockStatus } from '../manageMaterialsData'
import { cn } from '@/utils/cn'

interface MaterialsTableProps {
  materials: Material[]
  onView: (m: Material) => void
  onEdit: (m: Material, e: React.MouseEvent) => void
  onDelete: (m: Material) => void
}

export function MaterialsTable({
  materials,
  onView,
  onEdit,
  onDelete,
}: MaterialsTableProps) {
  const { t } = useTranslation()

  return (
    <div className="w-full overflow-auto">
      <table className="w-full min-w-[1024px] border-collapse">
        <thead>
          <tr className="bg-secondary-foreground text-slate-800">
            <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide">
              {t('manageMaterials.materialName')}
            </th>
            <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide">
              {t('manageMaterials.category')}
            </th>
            <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide">
              {t('manageMaterials.unit')}
            </th>
            <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide">
              {t('manageMaterials.totalStock')}
            </th>
            <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide">
              {t('manageMaterials.allocated')}
            </th>
            <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide">
              {t('manageMaterials.available')}
            </th>
            <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide">
              {t('manageMaterials.perUnit')}
            </th>
            <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide">
              {t('common.status')}
            </th>
            <th className="px-5 py-4 text-right text-xs font-bold uppercase tracking-wide">
              {t('manageMaterials.action')}
            </th>
          </tr>
        </thead>
        <tbody className="bg-white">
          {materials.length === 0 ? (
            <tr>
              <td
                colSpan={9}
                className="px-5 py-10 text-center text-muted-foreground text-sm"
              >
                {t('manageMaterials.noMaterialsFound')}
              </td>
            </tr>
          ) : (
            materials.map((item, index) => {
              const available = getAvailableStock(item)
              const stockStatus = getStockStatus(item)
              return (
                <motion.tr
                  key={item.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.02 * index }}
                  className="border-b border-gray-100/80 last:border-0 hover:bg-gray-50/40 transition-colors"
                >
                  <td className="px-5 py-4 text-sm font-medium text-slate-800">
                    {item.materialName}
                  </td>
                  <td className="px-5 py-4 text-sm text-slate-600">{item.category}</td>
                  <td className="px-5 py-4 text-sm text-slate-600">{item.unit}</td>
                  <td className="px-5 py-4 text-sm text-slate-700">{item.currentStock}</td>
                  <td className="px-5 py-4">
                    <span className="inline-flex rounded-full bg-sky-100 px-2.5 py-0.5 text-xs font-semibold text-sky-800">
                      {item.allocated}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-sm text-slate-700">{available}</td>
                  <td className="px-5 py-4 text-sm text-slate-700">
                    {formatCurrency(item.projectRate)}
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={cn(
                        'inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold',
                        stockStatus === 'low'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-emerald-100 text-emerald-800'
                      )}
                    >
                      {stockStatus === 'low'
                        ? t('manageMaterials.stockLow')
                        : t('manageMaterials.stockHealthy')}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-0.5">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => onView(item)}
                        className="h-9 w-9 text-slate-500 hover:bg-gray-100 hover:text-slate-700"
                        aria-label={t('manageMaterials.materialDetails')}
                      >
                        {/* <span className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 bg-white"> */}
                          <Info className="h-5 w-5 stroke-[1.75]" />
                        {/* </span> */}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={(e) => onEdit(item, e)}
                        className="h-9 w-9 text-emerald-600 hover:bg-emerald-50"
                        aria-label={t('common.edit')}
                      >
                        <Pencil className="h-5 w-5 stroke-[1.75]" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => onDelete(item)}
                        className="h-9 w-9 text-red-500 hover:bg-red-50"
                        aria-label={t('common.delete')}
                      >
                        <Trash2 className="h-5 w-5 stroke-[1.75]" />
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
