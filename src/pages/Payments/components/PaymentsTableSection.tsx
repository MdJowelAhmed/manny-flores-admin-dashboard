import { useTranslation } from 'react-i18next'
import { ChevronDown, Eye } from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Pagination } from '@/components/common/Pagination'
import { StatusBadge } from '@/components/common/StatusBadge'
import { formatCurrency, formatDateTime } from '@/utils/formatters'
import type { PaymentStatusUpdate } from '@/redux/api/paymentApi'

import {
  formatPaymentMethod,
  isRequestForCompleteStatus,
  type PaymentListItem,
} from '../paymentsData'

interface PaymentsTableSectionProps {
  paginatedRecords: PaymentListItem[]
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
  onPageChange: (page: number) => void
  onItemsPerPageChange: (limit: number) => void
  onViewCheckImage: (record: PaymentListItem) => void
  onStatusUpdate: (id: string, status: PaymentStatusUpdate) => void
  updatingPaymentId?: string | null
}

export function PaymentsTableSection({
  paginatedRecords,
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  onViewCheckImage,
  onStatusUpdate,
  updatingPaymentId,
}: PaymentsTableSectionProps) {
  const { t } = useTranslation()

  return (
    <Card className="bg-white border-0">
      <CardContent className="p-0">
        <div className="px-6 py-5 flex items-center justify-between">
          <h2 className="text-base font-semibold text-accent">{t('payments.tableTitle')}</h2>
        </div>

        <div className="w-full overflow-auto">
          <table className="w-full min-w-[1100px] border-collapse">
            <thead>
              <tr className="bg-secondary-foreground text-slate-800">
                <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide">
                  {t('payments.table.paymentId')}
                </th>
                <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide">
                  {t('payments.table.project')}
                </th>
                <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide">
                  {t('payments.table.customer')}
                </th>
                <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide">
                  {t('payments.table.method')}
                </th>
                <th className="px-5 py-4 text-right text-xs font-bold uppercase tracking-wide">
                  {t('payments.table.amount')}
                </th>
                <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide">
                  {t('payments.table.status')}
                </th>
                <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide">
                  {t('payments.table.createdAt')}
                </th>
                <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide">
                  {t('payments.table.trxId')}
                </th>
                <th className="px-5 py-4 text-right text-xs font-bold uppercase tracking-wide">
                  {t('common.actions')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white text-slate-700">
              {paginatedRecords.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-5 py-10 text-center text-sm text-muted-foreground">
                    {t('payments.noRecordsFound')}
                  </td>
                </tr>
              ) : (
                paginatedRecords.map((r) => {
                  const isCheque = r.method?.toUpperCase() === 'CHEQUE'
                  const hasCheckImage = Boolean(r.checkImageUrl)
                  const needsReview = isRequestForCompleteStatus(r.status)
                  const isUpdating = updatingPaymentId === r.id

                  return (
                    <tr
                      key={r.id}
                      className="border-b border-gray-100/80 last:border-0 hover:bg-gray-50/40 transition-colors"
                    >
                      <td className="px-5 py-4 text-sm font-medium" title={r.id}>
                        {r.id.slice(0, 8)}…
                      </td>
                      <td className="px-5 py-4 text-sm">{r.projectName || '—'}</td>
                      <td className="px-5 py-4 text-sm">{r.customerName || '—'}</td>
                      <td className="px-5 py-4 text-sm font-medium">
                        {formatPaymentMethod(r.method)}
                      </td>
                      <td className="px-5 py-4 text-sm font-medium text-right tabular-nums whitespace-nowrap">
                        {r.amount != null ? formatCurrency(r.amount) : '—'}
                      </td>
                      <td className="px-5 py-4">
                        <StatusBadge
                          status={r.status}
                          className="justify-center min-w-[120px] text-center"
                        />
                      </td>
                      <td className="px-5 py-4 text-sm whitespace-nowrap">
                        {formatDateTime(r.createdAt)}
                      </td>
                      <td className="px-5 py-4 text-sm max-w-[180px] truncate" title={r.trxId ?? ''}>
                        {r.trxId || '—'}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {isCheque && hasCheckImage && (
                            <button
                              type="button"
                              onClick={() => onViewCheckImage(r)}
                              className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold text-blue-600 hover:bg-blue-50 transition-colors"
                              aria-label={t('payments.actions.viewCheck')}
                            >
                              <Eye className="h-4 w-4" />
                              {t('payments.actions.viewCheck')}
                            </button>
                          )}

                          {needsReview ? (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  disabled={isUpdating}
                                  className="h-8 gap-1 border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800"
                                >
                                  {t('payments.actions.updateStatus')}
                                  <ChevronDown className="h-3.5 w-3.5" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-44">
                                <DropdownMenuItem
                                  className="cursor-pointer text-emerald-700 focus:text-emerald-700"
                                  disabled={isUpdating}
                                  onClick={() => onStatusUpdate(r.id, 'completed')}
                                >
                                  {t('payments.actions.markCompleted')}
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="cursor-pointer text-red-600 focus:text-red-600"
                                  disabled={isUpdating}
                                  onClick={() => onStatusUpdate(r.id, 'rejected')}
                                >
                                  {t('payments.actions.markRejected')}
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          ) : (
                            !isCheque || !hasCheckImage ? (
                              <span className="text-sm text-muted-foreground">—</span>
                            ) : null
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onPageChange={onPageChange}
          onItemsPerPageChange={onItemsPerPageChange}
          showItemsPerPage
        />
      </CardContent>
    </Card>
  )
}
