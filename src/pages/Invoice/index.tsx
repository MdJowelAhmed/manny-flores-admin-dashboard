import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Pagination } from '@/components/common/Pagination'
import { Button } from '@/components/ui/button'
import { cn } from '@/utils/cn'
import { formatCurrency, formatDate } from '@/utils/formatters'
import { getProjectStatusClasses } from '@/pages/Estimate/estimateData'
import { useGetInvoicesQuery, mapInvoiceFromApi } from '@/redux/api/invoiceApi'
import { consumePendingInvoices } from '@/pages/Estimate/estimateBridge'
import { computeInvoiceTotals, type InvoiceRecord } from './invoiceData'
import { InvoiceDetailsModal } from './InvoiceDetailsModal'
import { CreateInvoiceModal } from './CreateInvoiceModal'

export default function InvoicePage() {
  const { t } = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()
  const itemsPerPage = parseInt(searchParams.get('limit') || '10', 10) || 10
  const currentPage = Math.max(1, parseInt(searchParams.get('page') || '1', 10))

  const [detailsInvoice, setDetailsInvoice] = useState<InvoiceRecord | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [localExtras, setLocalExtras] = useState<InvoiceRecord[]>(() => consumePendingInvoices())

  const { data: invoiceData, isLoading, isFetching } = useGetInvoicesQuery({
    page: currentPage,
    limit: itemsPerPage,
  })

  const apiInvoices = useMemo(
    () => (invoiceData?.data ?? []).map(mapInvoiceFromApi),
    [invoiceData]
  )

  const invoices = useMemo(() => {
    const apiIds = new Set(apiInvoices.map((inv) => inv.id))
    const extras = localExtras.filter((inv) => !apiIds.has(inv.id))
    return [...extras, ...apiInvoices]
  }, [apiInvoices, localExtras])

  const totalItems = invoiceData?.pagination?.total ?? invoices.length
  const totalPages = Math.max(
    1,
    invoiceData?.pagination?.totalPage ?? Math.ceil(Math.max(totalItems, 1) / itemsPerPage)
  )

  const setPage = useCallback(
    (p: number) => {
      const next = new URLSearchParams(searchParams)
      p > 1 ? next.set('page', String(p)) : next.delete('page')
      setSearchParams(next, { replace: true })
    },
    [searchParams, setSearchParams]
  )

  const setLimit = useCallback(
    (l: number) => {
      const next = new URLSearchParams(searchParams)
      l !== 10 ? next.set('limit', String(l)) : next.delete('limit')
      next.delete('page')
      setSearchParams(next, { replace: true })
    },
    [searchParams, setSearchParams]
  )

  useEffect(() => {
    if (currentPage > totalPages && totalPages >= 1) setPage(1)
  }, [currentPage, totalPages, setPage])

  const pageInvoices = invoices

  return (
    <div className="space-y-6">
      <div className={cn('bg-white shadow-sm', 'text-gray-900')}>
        <div className="flex items-center justify-between gap-3 px-1 py-2">
          <h1 className="text-xl font-semibold text-gray-900">{t('invoice.pageTitle')}</h1>
          <Button
            type="button"
            className="bg-primary hover:bg-primary/90"
            onClick={() => setCreateOpen(true)}
          >
            {t('invoice.create.addNew')}
          </Button>
        </div>

        <div className="overflow-x-auto rounded-xl border border-gray-200 -mx-1">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="bg-[#E6F4EA] text-left">
                <th className="px-4 py-4 font-semibold first:rounded-tl-xl lg:pl-5 whitespace-nowrap">
                  {t('invoice.invoiceReference')}
                </th>
                <th className="px-4 py-4 font-semibold min-w-[140px]">{t('invoice.customer')}</th>
                <th className="px-4 py-4 font-semibold min-w-[120px]">{t('invoice.table.project', 'Project')}</th>
                <th className="px-4 py-4 font-semibold whitespace-nowrap">{t('invoice.issued')}</th>
                <th className="px-4 py-4 font-semibold whitespace-nowrap">{t('invoice.dueDate')}</th>
                <th className="px-4 py-4 font-semibold whitespace-nowrap">{t('estimate.table.status')}</th>
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
                const statusStyle = inv.projectStatus
                  ? getProjectStatusClasses(inv.projectStatus)
                  : { text: 'text-gray-500', dot: 'bg-gray-400' }
                const issuedLabel = inv.issuedDateDisplay ?? formatDate(inv.issuedDate, 'MMM d, yyyy')
                const dueLabel = inv.dueDateDisplay ?? formatDate(inv.dueDate, 'MMM d, yyyy')

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
                    <td className="px-4 py-3.5 text-gray-700 max-w-[180px] truncate" title={inv.projectName}>
                      {inv.projectName ?? '—'}
                    </td>
                    <td className="px-4 py-3.5 text-gray-600 tabular-nums whitespace-nowrap">
                      {issuedLabel}
                    </td>
                    <td className="px-4 py-3.5 text-gray-600 tabular-nums whitespace-nowrap">
                      {dueLabel}
                    </td>
                    <td className="px-4 py-3.5 align-middle">
                      {inv.projectStatus ? (
                        <span
                          className={cn(
                            'inline-flex items-center gap-2 font-medium',
                            statusStyle.text
                          )}
                        >
                          <span className={cn('h-2 w-2 shrink-0 rounded-full', statusStyle.dot)} />
                          {t(`estimate.projectStatus.${inv.projectStatus}`)}
                        </span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
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
              {!isLoading && !isFetching && pageInvoices.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-gray-500">
                    {t('common.noDataFound')}
                  </td>
                </tr>
              )}
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
                onItemsPerPageChange={setLimit}
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

      <CreateInvoiceModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreate={(inv) => {
          setLocalExtras((prev) => [inv, ...prev])
          setPage(1)
        }}
      />
    </div>
  )
}
