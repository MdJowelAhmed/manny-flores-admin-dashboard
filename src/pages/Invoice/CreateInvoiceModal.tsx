import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ModalWrapper } from '@/components/common'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DatePicker } from '@/components/common/Form'
import { cn } from '@/utils/cn'
import { formatDateISO } from '@/utils/formatters'
import { toast } from '@/utils/toast'
import type { InvoiceLineItem, InvoiceRecord, InvoiceUnitSuffix } from './invoiceData'
import { mockMaterialsData } from '../ManageMaterials/manageMaterialsData'

interface CreateInvoiceModalProps {
  open: boolean
  onClose: () => void
  onCreate: (invoice: InvoiceRecord) => void
}

type DraftLineItem = {
  id: string
  category: string
  quantity: string
  unitPrice: string
  unitSuffix: InvoiceUnitSuffix
}

function makeId(prefix: string) {
  const cryptoAny = crypto as unknown as { randomUUID?: () => string }
  return cryptoAny?.randomUUID ? `${prefix}-${cryptoAny.randomUUID()}` : `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function toNumberOrZero(v: string) {
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

function clampTaxPercent(n: number) {
  if (!Number.isFinite(n)) return 0
  return Math.min(100, Math.max(0, n))
}

export function CreateInvoiceModal({ open, onClose, onCreate }: CreateInvoiceModalProps) {
  const { t } = useTranslation()

  const [customerName, setCustomerName] = useState('')
  const [customerAddress, setCustomerAddress] = useState('')
  const [issuedDate, setIssuedDate] = useState<Date | undefined>(undefined)
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined)
  const [taxPercent, setTaxPercent] = useState('8.25')
  const [rows, setRows] = useState<DraftLineItem[]>(() => [
    { id: makeId('line'), category: '', quantity: '1', unitPrice: '', unitSuffix: 'unit' },
  ])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const materialOptions = useMemo(() => {
    const set = new Set<string>()
    for (const m of mockMaterialsData) {
      if (m.materialName?.trim()) set.add(m.materialName.trim())
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b))
  }, [])

  const handleClose = () => {
    setCustomerName('')
    setCustomerAddress('')
    setIssuedDate(undefined)
    setDueDate(undefined)
    setTaxPercent('8.25')
    setRows([{ id: makeId('line'), category: '', quantity: '1', unitPrice: '', unitSuffix: 'unit' }])
    onClose()
  }

  useEffect(() => {
    if (!open) return
    // Reset stale submit state when reopened
    setIsSubmitting(false)
  }, [open])

  const previewTotals = useMemo(() => {
    const subtotal = rows.reduce((sum, r) => sum + toNumberOrZero(r.quantity) * toNumberOrZero(r.unitPrice), 0)
    const taxPct = clampTaxPercent(toNumberOrZero(taxPercent))
    const taxAmount = subtotal * (taxPct / 100)
    const totalDue = subtotal + taxAmount
    return { subtotal, taxAmount, totalDue }
  }, [rows, taxPercent])

  const addRow = () => {
    setRows((prev) => [...prev, { id: makeId('line'), category: '', quantity: '1', unitPrice: '', unitSuffix: 'unit' }])
  }

  const removeRow = (id: string) => {
    setRows((prev) => (prev.length <= 1 ? prev : prev.filter((r) => r.id !== id)))
  }

  const updateRow = (id: string, patch: Partial<DraftLineItem>) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)))
  }

  const validate = () => {
    if (!customerName.trim()) return t('invoice.create.validationCustomerName')
    if (!issuedDate) return t('invoice.create.validationIssued')
    if (!dueDate) return t('invoice.create.validationDue')
    if (issuedDate && dueDate && issuedDate > dueDate) return t('invoice.create.validationDueAfterIssued')

    const hasValidLine = rows.some((r) => r.category.trim() && toNumberOrZero(r.quantity) > 0 && toNumberOrZero(r.unitPrice) > 0)
    if (!hasValidLine) return t('invoice.create.validationLineItems')

    return null
  }

  const handleCreate = async () => {
    const err = validate()
    if (err) {
      toast({ title: t('common.error'), description: err, variant: 'destructive' })
      return
    }

    setIsSubmitting(true)
    try {
      const taxPct = clampTaxPercent(toNumberOrZero(taxPercent))
      const lineItems: InvoiceLineItem[] = rows
        .filter((r) => r.category.trim())
        .map((r) => ({
          id: makeId('li'),
          category: r.category.trim(),
          quantity: toNumberOrZero(r.quantity),
          unitPrice: toNumberOrZero(r.unitPrice),
          unitSuffix: r.unitSuffix,
        }))
        .filter((r) => r.quantity > 0 && r.unitPrice > 0)

      const year = (issuedDate ?? new Date()).getFullYear()
      const short = String(Math.floor(100 + Math.random() * 900))

      const invoice: InvoiceRecord = {
        id: makeId('inv'),
        customerName: customerName.trim(),
        customerAddress: customerAddress.trim(),
        invoiceRef: `#INV-${year}-${short}`,
        issuedDate: formatDateISO(issuedDate!),
        dueDate: formatDateISO(dueDate!),
        taxPercent: taxPct,
        lineItems,
      }

      // Demo behavior: simulate server latency
      await new Promise((r) => setTimeout(r, 450))
      onCreate(invoice)
      toast({ title: t('common.created'), description: t('invoice.create.createdToast'), variant: 'success' })
      handleClose()
    } catch {
      toast({ title: t('common.error'), description: t('invoice.create.createFailedToast'), variant: 'destructive' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <ModalWrapper
      open={open}
      onClose={handleClose}
      title={t('invoice.create.modalTitle')}
      description={t('invoice.create.modalDescription')}
      size="full"
      className="bg-white text-gray-900"
      footer={
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="text-sm text-gray-600">
            <span className="font-medium text-gray-900">{t('invoice.totalDue')}:</span>{' '}
            <span className="tabular-nums font-semibold text-primary">
              {previewTotals.totalDue.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
            </span>
          </div>
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
              {t('common.cancel')}
            </Button>
            <Button
              type="button"
              className="bg-primary hover:bg-primary/90"
              onClick={handleCreate}
              disabled={isSubmitting}
              isLoading={isSubmitting}
            >
              {t('invoice.create.submit')}
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-6 pb-2">
        <div className="grid gap-5 lg:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="invoice-customer">{t('invoice.create.customerName')}</Label>
            <Input
              id="invoice-customer"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder={t('invoice.create.customerNamePlaceholder')}
              className="rounded-md border border-primary/30 focus-visible:ring-2 focus-visible:ring-primary"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="invoice-tax">{t('invoice.create.taxPercent')}</Label>
            <Input
              id="invoice-tax"
              inputMode="decimal"
              value={taxPercent}
              onChange={(e) => setTaxPercent(e.target.value)}
              placeholder="8.25"
              className="rounded-md border border-primary/30 focus-visible:ring-2 focus-visible:ring-primary"
            />
          </div>
          <div className="space-y-2 lg:col-span-2">
            <Label htmlFor="invoice-address">{t('invoice.create.customerAddress')}</Label>
            <Textarea
              id="invoice-address"
              value={customerAddress}
              onChange={(e) => setCustomerAddress(e.target.value)}
              placeholder={t('invoice.create.customerAddressPlaceholder')}
              rows={2}
              className="rounded-md border border-primary/30 focus-visible:ring-2 focus-visible:ring-primary resize-none"
            />
          </div>
          <div className="space-y-2">
            <Label>{t('invoice.create.issuedDate')}</Label>
            <DatePicker value={issuedDate} onChange={setIssuedDate} placeholder={t('invoice.create.issuedDatePlaceholder')} />
          </div>
          <div className="space-y-2">
            <Label>{t('invoice.create.dueDate')}</Label>
            <DatePicker value={dueDate} onChange={setDueDate} placeholder={t('invoice.create.dueDatePlaceholder')} />
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 overflow-hidden">
          <div className="flex items-center justify-between gap-3 px-4 py-3 bg-emerald-50/90">
            <p className="font-semibold text-gray-800">{t('invoice.create.lineItemsTitle')}</p>
            <Button type="button" variant="outline" size="sm" onClick={addRow}>
              {t('invoice.create.addLineItem')}
            </Button>
          </div>

          <div className="p-4 space-y-3">
            {rows.map((r, idx) => (
              <div
                key={r.id}
                className={cn(
                  'grid gap-3 items-end',
                  'grid-cols-1 md:grid-cols-[1.6fr_.6fr_.8fr_.8fr_auto]'
                )}
              >
                <div className="space-y-1">
                  {idx === 0 && <Label className="text-xs text-gray-600">{t('invoice.create.category')}</Label>}
                  <Select value={r.category || undefined} onValueChange={(v) => updateRow(r.id, { category: v })}>
                    <SelectTrigger
                      className="h-10 rounded-md border border-primary/20 focus:ring-primary"
                      disabled={materialOptions.length === 0}
                    >
                      <SelectValue
                        placeholder={
                          materialOptions.length === 0
                            ? t('invoice.create.noMaterials')
                            : t('invoice.create.categoryPlaceholder')
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {materialOptions.map((m) => (
                        <SelectItem key={m} value={m}>
                          {m}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  {idx === 0 && <Label className="text-xs text-gray-600">{t('invoice.create.qty')}</Label>}
                  <Input
                    inputMode="decimal"
                    value={r.quantity}
                    onChange={(e) => updateRow(r.id, { quantity: e.target.value })}
                    placeholder="1"
                    className="rounded-md border border-primary/20 focus-visible:ring-2 focus-visible:ring-primary"
                  />
                </div>

                <div className="space-y-1">
                  {idx === 0 && <Label className="text-xs text-gray-600">{t('invoice.create.unitPrice')}</Label>}
                  <Input
                    inputMode="decimal"
                    value={r.unitPrice}
                    onChange={(e) => updateRow(r.id, { unitPrice: e.target.value })}
                    placeholder="0.00"
                    className="rounded-md border border-primary/20 focus-visible:ring-2 focus-visible:ring-primary"
                  />
                </div>

                <div className="space-y-1">
                  {idx === 0 && <Label className="text-xs text-gray-600">{t('invoice.create.unit')}</Label>}
                  <Select value={r.unitSuffix} onValueChange={(v) => updateRow(r.id, { unitSuffix: v as InvoiceUnitSuffix })}>
                    <SelectTrigger className="h-10 rounded-md border border-primary/20 focus:ring-primary">
                      <SelectValue placeholder={t('common.select')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unit">{t('invoice.unitEach')}</SelectItem>
                      <SelectItem value="sqft">{t('invoice.unitSqft')}</SelectItem>
                      <SelectItem value="hr">{t('invoice.unitHr')}</SelectItem>
                      <SelectItem value="day">{t('invoice.unitDay')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeRow(r.id)}
                    disabled={rows.length <= 1}
                  >
                    {t('common.delete')}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ModalWrapper>
  )
}

