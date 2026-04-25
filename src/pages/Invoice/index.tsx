import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Pagination } from '@/components/common/Pagination'
import { Button } from '@/components/ui/button'
import { cn } from '@/utils/cn'
import { formatCurrency, formatDate } from '@/utils/formatters'
import { MOCK_INVOICES, computeInvoiceTotals, type InvoiceRecord } from './invoiceData'
import { InvoiceDetailsModal } from './InvoiceDetailsModal'

export default function InvoicePage() {
  const { t } = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [detailsInvoice, setDetailsInvoice] = useState<InvoiceRecord | null>(null)

  const currentPage = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
  const totalItems = MOCK_INVOICES.length
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage))

  const setPage = (p: number) => {
    const next = new URLSearchParams(searchParams)
    p > 1 ? next.set('page', String(p)) : next.delete('page')
    setSearchParams(next, { replace: true })
  }

  useEffect(() => {
    if (currentPage > totalPages) setPage(1)
  }, [currentPage, totalPages])

  const pageInvoices = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return MOCK_INVOICES.slice(start, start + itemsPerPage)
  }, [currentPage, itemsPerPage])

  const handleItemsPerPageChange = (limit: number) => {
    setItemsPerPage(limit)
    setPage(1)
  }

  return (
    <div className="space-y-6">
      <div
        className={cn(
          ' bg-white  shadow-sm',
          'text-gray-900'
        )}
      >
        {/* <h1 className="text-xl font-semibold text-gray-900 mb-8">{t('invoice.pageTitle')}</h1> */}

        <div className="overflow-x-auto rounded-xl border border-gray-200 -mx-1">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="bg-[#E6F4EA] text-left ">
                <th className="px-4 py-4 font-semibold first:rounded-tl-xl lg:pl-5 whitespace-nowrap">
                  {t('invoice.invoiceReference')}
                </th>
                <th className="px-4 py-4 font-semibold min-w-[160px]">{t('invoice.customer')}</th>
                <th className="px-4 py-4 font-semibold whitespace-nowrap">{t('invoice.issued')}</th>
                <th className="px-4 py-4 font-semibold whitespace-nowrap">{t('invoice.dueDate')}</th>
                <th className="px-4 py-4 font-semibold text-right whitespace-nowrap min-w-[120px]">
                  {t('invoice.totalDue')}
                </th>
                <th className="px-4 py-4 font-semibold text-right last:rounded-tr-xl lg:pr-5 w-[120px]">
                  {t('invoice.details')}
                </th>
              </tr>
            </thead>
            <tbody>
              {pageInvoices.map((inv, i) => {
                const { totalDue } = computeInvoiceTotals(inv)
                return (
                  <tr
                    key={inv.id}
                    className={cn(
                      'border-t border-gray-100 bg-white',
                      i === pageInvoices.length - 1 && 'border-b border-gray-100'
                    )}
                  >
                    <td className="px-4 py-3.5 font-medium text-primary lg:pl-5 whitespace-nowrap">
                      {inv.invoiceRef}
                    </td>
                    <td className="px-4 py-3.5 text-gray-800">{inv.customerName}</td>
                    <td className="px-4 py-3.5 text-gray-600 tabular-nums whitespace-nowrap">
                      {formatDate(inv.issuedDate, 'MMM d, yyyy')}
                    </td>
                    <td className="px-4 py-3.5 text-gray-600 tabular-nums whitespace-nowrap">
                      {formatDate(inv.dueDate, 'MMM d, yyyy')}
                    </td>
                    <td className="px-4 py-3.5 text-right tabular-nums font-medium text-gray-900">
                      {formatCurrency(totalDue)}
                    </td>
                    <td className="px-4 py-3.5 text-right lg:pr-5">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="font-medium"
                        onClick={() => setDetailsInvoice(inv)}
                      >
                        {t('invoice.details')}
                      </Button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          {totalItems > 0 && (
            <div className="">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalItems}
                itemsPerPage={itemsPerPage}
                onPageChange={setPage}
                onItemsPerPageChange={handleItemsPerPageChange}
                showItemsPerPage
              />
            </div>
          )}
        </div>

     
      </div>

      <InvoiceDetailsModal
        open={detailsInvoice !== null}
        onClose={() => setDetailsInvoice(null)}
        invoice={detailsInvoice}
      />
    </div>
  )
}
