import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Loader2, Printer, Download } from 'lucide-react'
import { ModalWrapper } from '@/components/common'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatDate } from '@/utils/formatters'
import { toast } from '@/utils/toast'
import { ESTIMATE_COMPANY } from '@/pages/Estimate/estimateData'
import { generateInvoicePdf } from './invoicePdf'
import {
  computeInvoiceTotals,
  type InvoiceLineItem,
  type InvoiceRecord,
  type InvoiceSignatures,
} from './invoiceData'

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
  onSign?: (invoice: InvoiceRecord, signatures: InvoiceSignatures) => void
  isSubmitting?: boolean
}

export function InvoiceDetailsModal({
  open,
  onClose,
  invoice,
  isSubmitting = false,
}: InvoiceDetailsModalProps) {
  const { t } = useTranslation()
  const printableRef = useRef<HTMLDivElement>(null)
  const [isPrinting, setIsPrinting] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)

  if (!invoice) return null

  const { subtotal, totalDue } = computeInvoiceTotals(invoice)
  const issuedLabel =
    invoice.issuedDateDisplay ?? formatDate(invoice.issuedDate, 'MMMM d, yyyy')
  const dueLabel = invoice.dueDateDisplay ?? formatDate(invoice.dueDate, 'MMMM d, yyyy')

  const hasCustomerSignature = !!invoice.customerSignature
  const hasProviderSignature = !!invoice.providerSignature
  const anySignature = hasCustomerSignature || hasProviderSignature

  const fileName = `${invoice.invoiceRef.replace(/[^a-z0-9-]/gi, '') || 'invoice'}.pdf`

  const runPdf = async (mode: 'print' | 'download') => {
    if (!printableRef.current) return
    const setBusy = mode === 'print' ? setIsPrinting : setIsDownloading
    setBusy(true)
    try {
      await generateInvoicePdf(printableRef.current, fileName, mode)
    } catch {
      toast({
        title: t('common.error'),
        description: t('invoice.pdfFailed', 'Could not generate the PDF. Please try again.'),
        variant: 'destructive',
      })
    } finally {
      setBusy(false)
    }
  }

  return (
    <ModalWrapper
      open={open}
      onClose={onClose}
      title={t('invoice.detailModalTitle')}
      description={`${invoice.invoiceRef} · ${invoice.projectName ?? invoice.customerName}`}
      size="full"
      className="max-w-4xl bg-white text-gray-900"
      footer={
        <div className="flex flex-wrap justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting || isPrinting || isDownloading}
          >
            {t('invoice.closeDetails')}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => runPdf('print')}
            disabled={isPrinting || isDownloading}
          >
            {isPrinting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Printer className="h-4 w-4 mr-2" />
            )}
            {t('invoice.print', 'Print')}
          </Button>
          <Button
            type="button"
            className="bg-primary hover:bg-primary/90 text-white"
            onClick={() => runPdf('download')}
            disabled={isPrinting || isDownloading}
          >
            {isDownloading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            {t('invoice.downloadPdf', 'Download PDF')}
          </Button>
        </div>
      }
    >
      <div ref={printableRef} className="space-y-8 bg-white p-1 pb-2 text-gray-900">
        <div className="flex flex-wrap items-start justify-between gap-6 border-b border-gray-100 pb-6">
          <div className="flex items-center gap-4">
            <img
              src="/image3.svg"
              alt={ESTIMATE_COMPANY.name}
              className="h-14 w-14 shrink-0 rounded-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none'
              }}
            />
            <div>
              <p className="text-xl font-bold">{ESTIMATE_COMPANY.name}</p>
              <p className="text-sm text-gray-500">{ESTIMATE_COMPANY.tagline}</p>
              <p className="mt-2 text-xs text-gray-500 leading-relaxed">
                {ESTIMATE_COMPANY.address}
                <br />
                {ESTIMATE_COMPANY.phone} · {ESTIMATE_COMPANY.email}
              </p>
            </div>
          </div>
          <div className="text-right">
            {/* <p className="text-xs font-medium uppercase tracking-wide text-gray-500 mb-1">
              {t('invoice.invoiceReference')}
            </p>
            <p className="text-2xl font-bold text-primary">{invoice.invoiceRef}</p> */}
            <p className="mt-3 text-xs font-medium uppercase tracking-wide text-gray-500">
              {t('invoice.preparedFor', 'Prepared for')}
            </p>
            <p className="text-lg font-bold">{invoice.customerName}</p>
            {invoice.customerEmail && (
              <p className="text-sm text-gray-500">{invoice.customerEmail}</p>
            )}
            {invoice.customerAddress && (
              <p className="mt-1 text-sm text-gray-500 max-w-xs ml-auto">
                {invoice.customerAddress}
              </p>
            )}
            {invoice.projectName && (
              <p className="mt-2 text-sm font-medium text-gray-700">{invoice.projectName}</p>
            )}
            <div className="mt-2 space-y-0.5 text-xs text-gray-500">
              <p>
                {t('invoice.issued')}: <span className="text-gray-700">{issuedLabel}</span>
              </p>
              <p>
                {t('invoice.dueDate')}: <span className="text-gray-700">{dueLabel}</span>
              </p>
            </div>
          </div>
        </div>

        {/* {invoice.description?.trim() && (
          <p className="-mt-3 text-sm text-gray-600">{invoice.description}</p>
        )} */}

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
              {invoice.lineItems.map((row) => {
                const lineTotal =
                  row.lineTotal != null ? row.lineTotal : row.quantity * row.unitPrice
                const suffix = t(unitSuffixKey(row.unitSuffix))
                return (
                  <tr key={row.id} className="border-t border-gray-100 bg-white">
                    <td className="px-4 py-3.5 text-gray-800 lg:pl-5">{row.category}</td>
                    <td className="px-4 py-3.5 text-right tabular-nums text-gray-800">
                      {formatQty(row.quantity)}
                    </td>
                    <td className="px-4 py-3.5 text-right tabular-nums text-gray-700">
                      {formatCurrency(row.unitPrice)} / {suffix}
                    </td>
                    <td className="px-4 py-3.5 text-right tabular-nums font-medium text-gray-900 lg:pr-5">
                      {formatCurrency(lineTotal)}
                    </td>
                  </tr>
                )
              })}
              {invoice.lineItems.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-sm text-gray-500">
                    {t('common.noDataFound')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end">
          <div className="rounded-xl bg-gray-50 border border-gray-100 px-5 py-4 w-full max-w-sm flex flex-col justify-end">
            <div className="flex justify-between gap-4 text-sm text-gray-600 py-1">
              <span>{t('invoice.subtotal')}</span>
              <span className="tabular-nums text-gray-900">{formatCurrency(subtotal)}</span>
            </div>
            <div className="my-3 border-t border-gray-200" />
            <div className="flex justify-between gap-4 items-baseline">
              <span className="font-bold text-gray-900">{t('invoice.totalDue')}</span>
              <span className="text-xl font-bold text-primary tabular-nums">{formatCurrency(totalDue)}</span>
            </div>
          </div>
        </div>

        {anySignature && (
          <div className="border-t border-gray-100 pt-6">
            <p className="text-sm font-semibold text-gray-900 mb-4">
              {t('invoice.signaturesTitle')}
            </p>
            <div className="grid gap-6 md:grid-cols-2">
              <SignaturePreview
                label={t('invoice.customerSignature')}
                src={invoice.customerSignature}
                emptyLabel={t('invoice.noSignatureYet')}
              />
              {hasProviderSignature && (
                <SignaturePreview
                  label={t('invoice.providerSignature')}
                  src={invoice.providerSignature}
                  emptyLabel={t('invoice.noSignatureYet')}
                />
              )}
              {invoice.signedAt && (
                <p className="md:col-span-2 text-xs text-gray-500">
                  {t('invoice.signedOn', {
                    date: new Date(invoice.signedAt).toLocaleString(),
                  })}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </ModalWrapper>
  )
}

function SignaturePreview({
  label,
  src,
  emptyLabel,
}: {
  label: string
  src?: string | null
  emptyLabel: string
}) {
  return (
    <div className="space-y-2">
      <span className="text-xs font-medium uppercase tracking-wide text-gray-500 block">
        {label}
      </span>
      {src ? (
        <img
          src={src}
          alt={label}
          crossOrigin="anonymous"
          className="max-h-28 w-full rounded-lg border border-gray-200 bg-white object-contain p-2"
        />
      ) : (
        <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50/70 px-4 py-6 text-sm text-gray-500">
          {emptyLabel}
        </div>
      )}
    </div>
  )
}
