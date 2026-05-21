import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ModalWrapper } from '@/components/common/ModalWrapper'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/utils/formatters'
import { ESTIMATE_COMPANY, type EstimateLineItem, type EstimateRecord } from '../estimateData'

function lineItemTotal(row: EstimateLineItem): number {
  if (row.lineTotal != null && !Number.isNaN(row.lineTotal)) return row.lineTotal
  return row.quantity * row.unitPrice
}
import { EstimateSignaturePad } from './EstimateSignaturePad'

interface EstimatePreviewModalProps {
  open: boolean
  onClose: () => void
  estimate: EstimateRecord | null
  onSign?: (estimate: EstimateRecord, signatureDataUrl: string) => void
  readOnly?: boolean
}

export function EstimatePreviewModal({
  open,
  onClose,
  estimate,
  onSign,
  readOnly = false,
}: EstimatePreviewModalProps) {
  const { t } = useTranslation()
  const [signing, setSigning] = useState(false)

  if (!estimate) return null

  const canSign = !readOnly && estimate.status === 'pending' && !!onSign
  const apiTotalCost = estimate.grandTotal
  const hasApiTotal =
    estimate.grandTotal !== undefined &&
    estimate.grandTotal !== null &&
    !Number.isNaN(Number(apiTotalCost))

  const handleSigned = (dataUrl: string) => {
    onSign?.(estimate, dataUrl)
    setSigning(false)
    onClose()
  }

  return (
    <ModalWrapper
      open={open}
      onClose={onClose}
      title={t('estimate.preview.title')}
      size="full"
      className="max-w-4xl bg-white"
      footer={
        <div className="flex flex-wrap gap-2 justify-end">
          <Button type="button" variant="outline" onClick={onClose}>
            {t('common.close')}
          </Button>
          {canSign && !signing && (
            <Button
              type="button"
              className="bg-primary text-white hover:bg-primary/90"
              onClick={() => setSigning(true)}
            >
              {t('estimate.preview.signAndAccept')}
            </Button>
          )}
        </div>
      }
    >
      {signing ? (
        <EstimateSignaturePad onSave={handleSigned} onCancel={() => setSigning(false)} />
      ) : (
        <div className="space-y-8 text-gray-900">
          <div className="flex flex-wrap items-start justify-between gap-6 border-b border-gray-100 pb-6">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[#00AB41] text-lg font-bold text-white">
                MF
              </div>
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
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                {t('estimate.preview.estimateFor')}
              </p>
              <p className="text-lg font-bold">{estimate.customerName}</p>
              {estimate.customerEmail && (
                <p className="text-sm text-gray-500">{estimate.customerEmail}</p>
              )}
              {estimate.customerAddress && (
                <p className="mt-1 text-sm text-gray-500 max-w-xs">{estimate.customerAddress}</p>
              )}
              <p className="mt-3 text-sm text-gray-600">
                <span className="font-medium">{estimate.title}</span>
              </p>
              <p className="text-xs text-gray-500">
                {estimate.deadlineFrom} — {estimate.deadlineTo}
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-emerald-50/90 text-left text-gray-800">
                  <th className="px-4 py-3 font-semibold">{t('estimate.preview.item')}</th>
                  <th className="px-4 py-3 font-semibold text-right w-20">{t('estimate.quantity')}</th>
                  <th className="px-4 py-3 font-semibold text-right min-w-[100px]">
                    {t('estimate.preview.unitPrice')}
                  </th>
                  <th className="px-4 py-3 font-semibold text-right min-w-[100px]">
                    {t('estimate.totalPrice')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {estimate.lineItems.map((row) => (
                  <tr key={row.id} className="border-t border-gray-100">
                    <td className="px-4 py-3 text-gray-800">{row.name}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{row.quantity}</td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      {formatCurrency(row.unitPrice)}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums font-medium">
                      {formatCurrency(lineItemTotal(row))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end">
            <div className="w-full max-w-xs space-y-2 text-sm">
              {hasApiTotal ? (
                <div className="flex justify-between border-t border-gray-200 pt-2 text-base font-bold text-gray-900">
                  <span>{t('estimate.preview.totalCost', 'Total cost')}</span>
                  <span className="tabular-nums text-primary">
                    {formatCurrency(Number(apiTotalCost))}
                  </span>
                </div>
              ) : (
                <div className="flex justify-between border-t border-gray-200 pt-2 text-base font-bold text-gray-900">
                  <span>{t('estimate.preview.balanceDue')}</span>
                  <span className="tabular-nums text-primary">
                    {formatCurrency(
                      estimate.lineItems.reduce((sum, row) => sum + lineItemTotal(row), 0)
                    )}
                  </span>
                </div>
              )}
              {estimate.taxPercent > 0 && hasApiTotal && (
                <p className="text-xs text-gray-500 text-right">
                  {t('estimate.preview.taxIncludedNote', 'Tax {{percent}}% included in total', {
                    percent: estimate.taxPercent,
                  })}
                </p>
              )}
            </div>
          </div>

          {estimate.signatureDataUrl && (
            <div className="border-t border-gray-100 pt-4">
              <p className="text-xs font-medium uppercase text-gray-500 mb-2">
                {t('estimate.preview.customerSignature')}
              </p>
              <img
                src={estimate.signatureDataUrl}
                alt=""
                className="max-h-24 rounded border border-gray-200 bg-white"
              />
              {estimate.signedAt && (
                <p className="mt-1 text-xs text-gray-500">
                  {t('estimate.preview.signedOn', {
                    date: new Date(estimate.signedAt).toLocaleString(),
                  })}
                </p>
              )}
            </div>
          )}

          {estimate.status === 'signed' && estimate.invoiceRef && (
            <p className="text-sm text-emerald-700 bg-emerald-50 rounded-lg px-3 py-2">
              {t('estimate.preview.invoiceCreated', { ref: estimate.invoiceRef })}
            </p>
          )}
        </div>
      )}
    </ModalWrapper>
  )
}
