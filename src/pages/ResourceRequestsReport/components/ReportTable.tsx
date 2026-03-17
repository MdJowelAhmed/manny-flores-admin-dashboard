import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Info, Unlock, Trash2 } from 'lucide-react'
import { Truck, Package, Wrench } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { ResourceReport, ResourceCategory } from '../resourceRequestsData'
import { RESOURCE_COLORS } from '../resourceRequestsData'
import { cn } from '@/utils/cn'

const RESOURCE_ICONS: Record<ResourceCategory, React.ElementType> = {
  Vehicle: Truck,
  Material: Package,
  Equipment: Wrench,
}

interface ReportTableProps {
  records: ResourceReport[]
  onView: (r: ResourceReport) => void
  onEdit: (r: ResourceReport, e: React.MouseEvent) => void
  onDelete: (r: ResourceReport) => void
}

export function ReportTable({
  records,
  onView,
  onEdit,
  onDelete,
}: ReportTableProps) {
  const { t } = useTranslation()
  return (
    <div className="w-full overflow-auto">
      <table className="w-full min-w-[800px]">
        <thead>
          <tr className="bg-secondary-foreground text-accent">
            <th className="px-6 py-4 text-left text-sm font-semibold rounded-tl-lg">{t('common.date')}</th>
            <th className="px-6 py-4 text-left text-sm font-semibold">{t('resourceRequests.reportedBy')}</th>
            <th className="px-6 py-4 text-left text-sm font-semibold">{t('resourceRequests.item')}</th>
            <th className="px-6 py-4 text-left text-sm font-semibold">{t('resourceRequests.resourceType')}</th>
            <th className="px-6 py-4 text-left text-sm font-semibold">{t('manageMaterials.category')}</th>
            <th className="px-6 py-4 text-left text-sm font-semibold">{t('resourceRequests.urgency')}</th>
            <th className="px-6 py-4 text-left text-sm font-semibold">{t('common.status')}</th>
            <th className="px-6 py-4 text-right text-sm font-semibold rounded-tr-lg">{t('common.actions')}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white">
          {records.length === 0 ? (
            <tr>
              <td
                colSpan={8}
                className="px-4 py-8 text-center text-muted-foreground text-sm"
              >
                {t('resourceRequests.noReportsFound')}
              </td>
            </tr>
          ) : (
            records.map((r, index) => {
              const colors = RESOURCE_COLORS[r.category]
              const IconComp = RESOURCE_ICONS[r.category]
              return (
                <motion.tr
                  key={r.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.02 * index }}
                  className="hover:bg-gray-50/50 transition-colors shadow-sm"
                >
                  <td className="px-4 py-3 text-sm text-slate-700">{r.date}</td>
                  <td className="px-4 py-3 text-sm text-slate-700">{r.reportedBy}</td>
                  <td className="px-4 py-3 text-sm text-slate-700">{r.item}</td>
                  <td className="px-4 py-3 text-sm text-slate-700">{r.type}</td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        'inline-flex items-center gap-1.5 text-sm font-medium',
                        colors.text
                      )}
                    >
                      <IconComp className="h-4 w-4 shrink-0" />
                      {r.category}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        'text-sm font-medium',
                        r.urgency === 'High' ? 'text-red-600' : 'text-slate-700'
                      )}
                    >
                      {r.urgency}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-700">{r.status}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => onView(r)}
                        className="h-8 w-8 text-slate-500 hover:text-sky-600 hover:bg-sky-50"
                      >
                        <Info className="h-5 w-5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={(e) => onEdit(r, e)}
                        className="h-8 w-8 text-slate-500 hover:text-green-600 hover:bg-green-50"
                      >
                        <Unlock className="h-5 w-5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => onDelete(r)}
                        className="h-8 w-8 text-slate-500 hover:text-red-600 hover:bg-red-50"
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
