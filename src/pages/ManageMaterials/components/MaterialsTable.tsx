import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Info, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Material } from '../manageMaterialsData'
import { formatCurrency } from '@/utils/formatters'

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
      <table className="w-full min-w-[720px] border-collapse">
        <thead>
          <tr className="bg-secondary-foreground text-slate-800">
            <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide">
              {t('manageMaterials.materialName')}
            </th>
            <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide">
              {t('manageMaterials.category')}
            </th>
            <th className="px-5 py-4 text-right text-xs font-bold uppercase tracking-wide">
              {t('manageMaterials.unitPrice')}
            </th>
            <th className="px-5 py-4 text-right text-xs font-bold uppercase tracking-wide">
              {t('manageMaterials.quantity')}
            </th>
            <th className="px-5 py-4 text-right text-xs font-bold uppercase tracking-wide">
              {t('manageMaterials.totalStock')}
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
                colSpan={6}
                className="px-5 py-10 text-center text-muted-foreground text-sm"
              >
                {t('manageMaterials.noMaterialsFound')}
              </td>
            </tr>
          ) : (
            materials.map((item, index) => (
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
                <td className="px-5 py-4 text-sm text-slate-600">{item.category || '—'}</td>
                <td className="px-5 py-4 text-sm text-slate-700 text-right tabular-nums">
                  {formatCurrency(item.unitPrice)}
                </td>
                <td className="px-5 py-4 text-sm text-slate-700 text-right tabular-nums">
                  {item.quantity}
                </td>
                <td className="px-5 py-4 text-sm text-slate-700 text-right tabular-nums">
                  {item.stock}
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
                      <Info className="h-5 w-5 stroke-[1.75]" />
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
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
