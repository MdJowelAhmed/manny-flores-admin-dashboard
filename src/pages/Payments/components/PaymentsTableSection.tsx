import { useTranslation } from 'react-i18next'
import { CheckCircle2, Upload, BadgeDollarSign } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Pagination } from '@/components/common/Pagination'
import { StatusBadge } from '@/components/common/StatusBadge'
import { cn } from '@/utils/cn'
import { formatCurrency, formatDateTime } from '@/utils/formatters'

import type { PaymentMethod, PaymentRecord } from '../paymentsData'

function methodLabel(method: PaymentMethod) {
  switch (method) {
    case 'cash':
      return 'Cash'
    case 'check':
      return 'Check'
    case 'card':
      return 'Card'
    case 'financing':
      return 'Financing'
    default:
      return method
  }
}

interface PaymentsTableSectionProps {
  paginatedRecords: PaymentRecord[]
  isSuperAdmin: boolean
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
  onPageChange: (page: number) => void
  onItemsPerPageChange: (limit: number) => void
  onUploadProof: (record: PaymentRecord) => void
  onMarkPaid: (recordId: string) => void
  onRecordCashReceived: (recordId: string) => void
  onShowApprovalRules: () => void
}

export function PaymentsTableSection({
  paginatedRecords,
  isSuperAdmin,
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  onUploadProof,
  onMarkPaid,
  onRecordCashReceived,
  onShowApprovalRules,
}: PaymentsTableSectionProps) {
  const { t } = useTranslation()

  const canMarkPaid = (r: PaymentRecord) => {
    if (r.status === 'paid') return false
    if (r.method === 'cash') return isSuperAdmin && Boolean(r.cashReceivedRecorded)
    if (r.method === 'check') return Boolean(r.proofImageUrl)
    return true
  }

  return (
    <Card className="bg-white border-0">
      <CardContent className="p-0">
        <div className="px-6 py-5 flex items-center justify-between">
          <h2 className="text-base font-semibold text-accent">{t('payments.tableTitle')}</h2>

        </div>

        <div className="w-full overflow-auto">
          <table className="w-full min-w-[1180px]">
            <thead>
              <tr className="bg-secondary-foreground text-accent">
                <th className="px-6 py-4 text-left text-sm font-bold">{t('payments.table.paymentId')}</th>
                <th className="px-6 py-4 text-left text-sm font-bold">{t('payments.table.project')}</th>
                <th className="px-6 py-4 text-left text-sm font-bold">{t('payments.table.customer')}</th>
                <th className="px-6 py-4 text-left text-sm font-bold">{t('payments.table.method')}</th>
                <th className="px-6 py-4 text-left text-sm font-bold">{t('payments.table.total')}</th>
                <th className="px-6 py-4 text-left text-sm font-bold">{t('payments.table.paid')}</th>
                <th className="px-6 py-4 text-left text-sm font-bold">{t('payments.table.status')}</th>
                <th className="px-6 py-4 text-left text-sm font-bold">{t('payments.table.receivedAt')}</th>
                <th className="px-6 py-4 text-left text-sm font-bold">{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-slate-700">
              {paginatedRecords.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-10 text-center text-sm text-muted-foreground">
                    {t('payments.noRecordsFound')}
                  </td>
                </tr>
              ) : (
                paginatedRecords.map((r) => {
                  const markPaidDisabled = !canMarkPaid(r)
                  const needsProof = r.method === 'check' && !r.proofImageUrl
                  const cashNeedsManny = r.method === 'cash' && !isSuperAdmin

                  return (
                    <tr
                      key={r.id}
                      className="hover:bg-gray-50/50 transition-colors shadow-sm"
                    >
                      <td className="px-6 py-5 text-sm font-medium">{r.paymentId}</td>
                      <td className="px-6 py-5 text-sm">{r.projectName}</td>
                      <td className="px-6 py-5 text-sm">{r.customerName}</td>
                      <td className="px-6 py-5 text-sm font-medium">
                        {methodLabel(r.method)}
                      </td>
                      <td className="px-6 py-5 text-sm font-medium whitespace-nowrap">
                        {formatCurrency(r.totalAmount)}
                      </td>
                      <td className="px-6 py-5 text-sm font-medium whitespace-nowrap">
                        {formatCurrency(r.paidAmount)}
                      </td>
                      <td className="px-6 py-5">
                        <StatusBadge
                          status={r.status}
                          className={r.status === 'pending' ? 'bg-secondary-foreground text-black justify-center w-24 text-center' : "justify-center w-24 text-center"}
                        />
                      </td>
                      <td className="px-6 py-5 text-sm whitespace-nowrap">
                        {formatDateTime(r.receivedAt)}
                      </td>
                      <td className="px-6 py-5 text-center">
                        <div className="flex items-center gap-3">

                          <div className="w-6 flex justify-center">
                            {r.method === 'check' && (
                              <button
                                type="button"
                                onClick={() => onUploadProof(r)}
                                className={cn(
                                  'text-gray-400 hover:text-gray-600 transition-colors',
                                  needsProof && 'text-amber-500 hover:text-amber-600'
                                )}
                                aria-label={t('payments.actions.uploadProof')}
                                title={t('payments.actions.uploadProof')}
                              >
                                <Upload className="h-5 w-5" />
                              </button>
                            )}
                          </div>

                          {r.method === 'cash' && !r.cashReceivedRecorded && (
                            <button
                              type="button"
                              onClick={() => onRecordCashReceived(r.id)}
                              className="rounded-md bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-emerald-600"
                            >
                              {t('payments.actions.recordReceived')}
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => onMarkPaid(r.id)}
                            disabled={markPaidDisabled}
                            className={cn(
                              'rounded-md px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors',
                              markPaidDisabled
                                ? 'bg-gray-300 cursor-not-allowed'
                                : 'bg-emerald-500 hover:bg-emerald-600'
                            )}
                            title={
                              needsProof
                                ? t('payments.rules.checkNeedsProof')
                                : cashNeedsManny
                                  ? t('payments.rules.cashMannyOnly')
                                  : undefined
                            }
                          >
                            <span className="inline-flex items-center gap-2">
                              <CheckCircle2 className="h-4 w-4" />
                              {t('payments.actions.markPaid')}
                            </span>
                          </button>
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

