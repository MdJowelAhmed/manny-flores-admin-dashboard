import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Upload } from 'lucide-react'
import { ModalWrapper } from '@/components/common'
import { FormInput, FormTextarea } from '@/components/common/Form'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { ChangeOrder } from '../changeOrdersData'
import {
  newOrderProjectOptions,
  changeReasonOptions,
} from '../changeOrdersData'
import { formatDateDisplay } from '@/utils/formatters'
import { toast } from '@/utils/toast'
import { cn } from '@/utils/cn'

const inputClass = 'rounded-lg bg-muted/40 border-gray-200/80 h-11'

interface NewChangeOrderModalProps {
  open: boolean
  onClose: () => void
  onCreate: (order: ChangeOrder) => void
}

export function NewChangeOrderModal({ open, onClose, onCreate }: NewChangeOrderModalProps) {
  const { t } = useTranslation()
  const [projectName, setProjectName] = useState(newOrderProjectOptions[0]?.value ?? '')
  const [client, setClient] = useState('')
  const [reasonKey, setReasonKey] = useState(changeReasonOptions[0]?.value ?? '')
  const [delayDays, setDelayDays] = useState('0')
  const [description, setDescription] = useState('')
  const [originalCost, setOriginalCost] = useState('45000')
  const [additionalCost, setAdditionalCost] = useState('0')

  useEffect(() => {
    if (open) {
      setProjectName(newOrderProjectOptions[0]?.value ?? '')
      setClient('')
      setReasonKey(changeReasonOptions[0]?.value ?? '')
      setDelayDays('0')
      setDescription('')
      setOriginalCost('45000')
      setAdditionalCost('0')
    }
  }, [open])

  const orig = Number.parseFloat(originalCost.replace(/[^0-9.-]/g, '')) || 0
  const add = Number.parseFloat(additionalCost.replace(/[^0-9.-]/g, '')) || 0
  const newTotal = orig + add

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!projectName.trim() || !client.trim()) {
      toast({
        title: t('common.error'),
        description: t('changeOrders.newOrderRequired'),
        variant: 'destructive',
      })
      return
    }

    const reasonLabel = changeReasonOptions.find((r) => r.value === reasonKey)
      ? t(reasonLabelKey(reasonKey))
      : reasonKey

    const order: ChangeOrder = {
      id: `co-${Date.now()}`,
      orderId: `CO-2026-${String(Math.floor(100 + Math.random() * 899)).padStart(3, '0')}`,
      customerName: client.trim(),
      serviceType: t('changeOrders.defaultServiceType'),
      projectName: projectName.trim(),
      projectId: `PRJ-${8000 + Math.floor(Math.random() * 1000)}`,
      siteAddress: '—',
      company: '—',
      contactNumber: '—',
      originalCost: orig,
      additionalCost: add,
      newTotal,
      requestDate: formatDateDisplay(new Date()),
      status: 'Pending',
      projectStartDate: formatDateDisplay(new Date()),
      amountSpent: Math.min(orig * 0.5, orig),
      totalBudget: orig,
      duration: t('changeOrders.delayDaysLabel', { days: delayDays || '0' }),
      remaining: Math.max(0, orig - add),
      email: '',
      reasonForChange: `${reasonLabel}. ${description.trim()}`.trim(),
      attachments: [],
    }

    onCreate(order)
    toast({
      title: t('common.success'),
      description: t('changeOrders.newOrderCreated'),
      variant: 'success',
    })
    onClose()
  }

  function reasonLabelKey(v: string): string {
    const opt = changeReasonOptions.find((r) => r.value === v)
    return opt?.labelKey ?? 'changeOrders.reasonClientRequest'
  }

  return (
    <ModalWrapper
      open={open}
      onClose={onClose}
      title={t('changeOrders.newChangeOrder')}
      size="xl"
      className="max-w-2xl bg-white sm:rounded-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-1.5">
          <label className="text-sm font-medium">{t('changeOrders.selectProject')}</label>
          <Select value={projectName} onValueChange={setProjectName}>
            <SelectTrigger className={cn(inputClass, 'w-full')}>
              <SelectValue placeholder={t('changeOrders.selectProjectPlaceholder')} />
            </SelectTrigger>
            <SelectContent>
              {newOrderProjectOptions.map((p) => (
                <SelectItem key={p.value} value={p.value}>
                  {t(p.labelKey)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <FormInput
          label={t('changeOrders.client')}
          placeholder={t('changeOrders.clientPlaceholder')}
          value={client}
          onChange={(e) => setClient(e.target.value)}
          required
          className={cn(inputClass)}
        />

        <div className="space-y-1.5">
          <label className="text-sm font-medium">{t('changeOrders.reasonForChangeSelect')}</label>
          <Select value={reasonKey} onValueChange={setReasonKey}>
            <SelectTrigger className={cn(inputClass, 'w-full')}>
              <SelectValue placeholder={t('changeOrders.reasonPlaceholder')} />
            </SelectTrigger>
            <SelectContent>
              {changeReasonOptions.map((r) => (
                <SelectItem key={r.value} value={r.value}>
                  {t(r.labelKey)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <FormInput
          label={t('changeOrders.estimatedDelayDays')}
          type="number"
          min={0}
          value={delayDays}
          onChange={(e) => setDelayDays(e.target.value)}
          className={cn(inputClass)}
        />

        <FormTextarea
          label={t('changeOrders.descriptionOfWork')}
          placeholder={t('changeOrders.descriptionPlaceholder')}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          className="rounded-lg bg-muted/40 border-gray-200/80 min-h-[100px]"
        />

        <div>
          <h4 className="text-sm font-semibold text-foreground mb-3">
            {t('changeOrders.financialImpactDetails')}
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <FormInput
              label={t('changeOrders.originalCost')}
              value={originalCost}
              onChange={(e) => setOriginalCost(e.target.value)}
              inputMode="decimal"
              className={cn(inputClass)}
            />
            <FormInput
              label={t('changeOrders.additionalCost')}
              value={additionalCost}
              onChange={(e) => setAdditionalCost(e.target.value)}
              inputMode="decimal"
              className={cn(inputClass)}
            />
            <div className="space-y-1.5">
              <label className="text-sm font-medium">{t('changeOrders.newTotal')}</label>
              <div
                className={cn(
                  'h-11 flex items-center px-3 rounded-lg border border-gray-200/80 bg-muted/30',
                  'text-sm font-semibold text-primary'
                )}
              >
                ${newTotal.toLocaleString('en-US')}
              </div>
            </div>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium block mb-2">{t('changeOrders.documentation')}</label>
          <div
            className={cn(
              'rounded-xl border-2 border-dashed border-muted-foreground/25 bg-muted/20',
              'px-4 py-8 text-center cursor-pointer hover:border-primary/40 transition-colors'
            )}
          >
            <input type="file" className="hidden" id="co-upload" accept=".png,.jpg,.jpeg,.pdf" multiple />
            <label htmlFor="co-upload" className="cursor-pointer flex flex-col items-center gap-2">
              <div className="p-3 rounded-full bg-orange-500/15">
                <Upload className="h-6 w-6 text-orange-600" />
              </div>
              <span className="text-sm text-muted-foreground max-w-sm">{t('changeOrders.uploadHint')}</span>
            </label>
          </div>
        </div>

        <div className="flex flex-col-reverse sm:flex-row gap-3 sm:justify-end pt-2">
          <Button type="button" variant="outline" className="rounded-lg border-gray-200" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" className="rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground">
            {t('changeOrders.generateChangeOrder')}
          </Button>
        </div>
      </form>
    </ModalWrapper>
  )
}
