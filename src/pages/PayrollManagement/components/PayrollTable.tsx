import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Info, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { PayrollRecord,  } from '../payrollData'

import { formatCurrency } from '@/utils/formatters'
import { cn } from '@/utils/cn'

interface PayrollTableProps {
  records: PayrollRecord[]
  onView: (r: PayrollRecord) => void
  onEdit: (r: PayrollRecord, e: React.MouseEvent) => void
  onDelete: (r: PayrollRecord) => void
}

export function PayrollTable({
  records,
  onView,
  onEdit,
  onDelete,
}: PayrollTableProps) {
  const { t } = useTranslation()
  return (
    <div className="w-full overflow-auto">
      <table className="w-full min-w-[700px]">
        <thead>
          <tr className="bg-[#E6F4EA] text-slate-700">
            <th className="px-6 py-4 text-left text-sm font-semibold rounded-tl-lg">{t('dashboard.id')}</th>
            <th className="px-6 py-4 text-left text-sm font-semibold">{t('common.name')}</th>
            <th className="px-6 py-4 text-left text-sm font-semibold">{t('payrollManagement.payType')}</th>
            <th className="px-6 py-4 text-left text-sm font-semibold">{t('companyProjects.project')}</th>
            <th className="px-6 py-4 text-left text-sm font-semibold">{t('payrollManagement.overtime')}</th>
            <th className="px-6 py-4 text-left text-sm font-semibold">{t('common.amount')}</th>
            <th className="px-6 py-4 text-left text-sm font-semibold">{t('common.status')}</th>
            <th className="px-6 py-4 text-right text-sm font-semibold rounded-tr-lg">{t('common.actions')}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white">
          {records.length === 0 ? (
            <tr>
              <td colSpan={8} className="px-4 py-8 text-center text-muted-foreground text-sm">
                {t('payrollManagement.noRecordsFound')}
              </td>
            </tr>
          ) : (
            records.map((r, index) => {
              // const payStyle = PAY_TYPE_STYLES[r.payType as PayType]
              return (
                <motion.tr
                  key={r.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.02 * index }}
                  className="hover:bg-gray-50/50 transition-colors"
                >
                  <td className="px-4 py-3 text-sm text-slate-700">{r.payrollId}</td>
                  <td className="px-4 py-3 text-sm text-slate-700">{r.name}</td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        'inline-flex px-3 py-1 rounded-full text-xs font-medium bg-secondary-foreground text-[#9810FA] w-28 text-center justify-center items-center',
                       
                      
                      )}
                    >
                      {r.payType}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-700">{r.project}</td>
                  <td className="px-4 py-3 text-sm text-slate-700">
                    {formatCurrency(r.overtime)}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-700 font-medium">
                    {formatCurrency(r.amount)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={cn(
                          'h-2 w-2 rounded-full shrink-0',
                          r.status === 'Paid' ? 'bg-emerald-500' : 'bg-amber-500'
                        )}
                      />
                      <span className="text-sm">{r.status}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={(e) => onEdit(r, e)}
                        className="h-8 px-3 text-xs font-medium border-blue-500 text-blue-600 hover:bg-blue-50"
                      >
                        {t('payrollManagement.paymentAction')}
                      </Button>
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
