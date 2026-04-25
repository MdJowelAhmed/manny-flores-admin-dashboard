import { useTranslation } from 'react-i18next'
import { ModalWrapper } from '@/components/common'
import { Button } from '@/components/ui/button'
import { cn } from '@/utils/cn'
import { formatCurrency, formatDate } from '@/utils/formatters'
import { computeInvoiceTotals, type InvoiceLineItem, type InvoiceRecord } from './invoiceData'

function formatQty(n: number) {
  return Number.isInteger(n) ? String(n) : n.toLocaleString('en-US', { maximumFractionDigits: 2 })
}

function unitSuffixKey(s: InvoiceLineItem['unitSuffix']) {
  switch (s) {
    case 'sqft':
      return 'invoice.unitSqft'
    case 'hr':
      return 'invoice.unitHr'
    case 'day':
      return 'invoice.unitDay'
    default:
      return 'invoice.unitEach'
  }
}

interface InvoiceDetailsModalProps {
  open: boolean
  onClose: () => void
  invoice: InvoiceRecord | null
}

export function InvoiceDetailsModal({ open, onClose, invoice }: InvoiceDetailsModalProps) {
  const { t } = useTranslation()

  if (!invoice) return null

  const { subtotal, taxAmount, totalDue } = computeInvoiceTotals(invoice)

  return (
    <ModalWrapper
      open={open}
      onClose={onClose}
      title={t('invoice.detailModalTitle')}
      description={`${invoice.invoiceRef} · ${invoice.customerName}`}
      size="full"
      className="bg-white text-gray-900"
      footer={
        <div className="flex justify-end">
          <Button type="button" variant="default" className="bg-primary hover:bg-primary/90" onClick={onClose}>
            {t('invoice.closeDetails')}
          </Button>
        </div>
      }
    >
      <div className="space-y-8 pb-2">
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500 mb-2">
              {t('invoice.customerDetails')}
            </p>
            <p className="text-2xl font-bold text-gray-900">{invoice.customerName}</p>
            <p className="mt-2 text-sm text-gray-500 leading-relaxed max-w-md">{invoice.customerAddress}</p>
          </div>
          <div className="lg:text-right">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500 mb-2">
              {t('invoice.invoiceReference')}
            </p>
            <p className="text-2xl font-bold text-primary">{invoice.invoiceRef}</p>
            <div className="mt-4 space-y-1 text-sm text-gray-500">
              <p>
                {t('invoice.issued')}:{' '}
                <span className="text-gray-700">{formatDate(invoice.issuedDate, 'MMMM d, yyyy')}</span>
              </p>
              <p>
                {t('invoice.dueDate')}:{' '}
                <span className="text-gray-700">{formatDate(invoice.dueDate, 'MMMM d, yyyy')}</span>
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-emerald-50/90 text-left text-gray-800">
                <th className="px-4 py-3 font-semibold first:rounded-tl-xl lg:pl-5">{t('invoice.category')}</th>
                <th className="px-4 py-3 font-semibold text-right w-[88px]">{t('invoice.qty')}</th>
                <th className="px-4 py-3 font-semibold text-right min-w-[140px]">{t('invoice.unitPrice')}</th>
                <th className="px-4 py-3 font-semibold text-right last:rounded-tr-xl lg:pr-5 min-w-[120px]">
                  {t('invoice.lineTotal')}
                </th>
              </tr>
            </thead>
            <tbody>
              {invoice.lineItems.map((row, i) => {
                const lineTotal = row.quantity * row.unitPrice
                const suffix = t(unitSuffixKey(row.unitSuffix))
                return (
                  <tr
                    key={row.id}
                    className={cn(
                      'border-t border-gray-100 bg-white',
                      i === invoice.lineItems.length - 1 && 'border-b border-gray-100'
                    )}
                  >
                    <td className="px-4 py-3.5 text-gray-800 lg:pl-5">{row.category}</td>
                    <td className="px-4 py-3.5 text-right tabular-nums text-gray-800">{formatQty(row.quantity)}</td>
                    <td className="px-4 py-3.5 text-right tabular-nums text-gray-700">
                      {formatCurrency(row.unitPrice)} / {suffix}
                    </td>
                    <td className="px-4 py-3.5 text-right tabular-nums font-medium text-gray-900 lg:pr-5">
                      {formatCurrency(lineTotal)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <div className="rounded-xl bg-gray-50 border border-gray-100 px-5 py-4 w-full max-w-sm">
          <div className="flex justify-between gap-4 text-sm text-gray-600 py-1">
            <span>{t('invoice.subtotal')}</span>
            <span className="tabular-nums text-gray-900">{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between gap-4 text-sm text-gray-600 py-1">
            <span>{t('invoice.taxWithPercent', { percent: invoice.taxPercent })}</span>
            <span className="tabular-nums text-gray-900">{formatCurrency(taxAmount)}</span>
          </div>
          <div className="my-3 border-t border-gray-200" />
          <div className="flex justify-between gap-4 items-baseline">
            <span className="font-bold text-gray-900">{t('invoice.totalDue')}</span>
            <span className="text-xl font-bold text-primary tabular-nums">{formatCurrency(totalDue)}</span>
          </div>
        </div>
      </div>
    </ModalWrapper>
  )
}
