import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ModalWrapper } from '@/components/common/ModalWrapper'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from '@/utils/toast'
import type { EstimateListItem, EstimateStatus } from '../estimateData'

interface AddEstimateModalProps {
  open: boolean
  onClose: () => void
  onCreate: (item: EstimateListItem) => void
}

const PAYMENT_OPTIONS = ['Paypal', 'Google pay', 'Bank transfer', 'Card'] as const

function newEstimateId() {
  return `est-${Date.now()}`
}

export function AddEstimateModal({ open, onClose, onCreate }: AddEstimateModalProps) {
  const { t } = useTranslation()

  const [projectName, setProjectName] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [location, setLocation] = useState('')
  const [deadlineFrom, setDeadlineFrom] = useState('')
  const [deadlineTo, setDeadlineTo] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<(typeof PAYMENT_OPTIONS)[number] | ''>('')
  const [status, setStatus] = useState<EstimateStatus>('pending')
  const [description, setDescription] = useState('')

  const canSubmit = useMemo(() => {
    return (
      projectName.trim().length > 0 &&
      customerName.trim().length > 0 &&
      location.trim().length > 0 &&
      deadlineFrom.trim().length > 0 &&
      deadlineTo.trim().length > 0 &&
      paymentMethod.trim().length > 0
    )
  }, [projectName, customerName, location, deadlineFrom, deadlineTo, paymentMethod])

  useEffect(() => {
    if (!open) return
    setProjectName('')
    setCustomerName('')
    setLocation('')
    setDeadlineFrom('')
    setDeadlineTo('')
    setPaymentMethod('')
    setStatus('pending')
    setDescription('')
  }, [open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return

    const item: EstimateListItem = {
      id: newEstimateId(),
      title: projectName.trim(),
      customerName: customerName.trim(),
      location: location.trim(),
      deadlineFrom: deadlineFrom.trim(),
      deadlineTo: deadlineTo.trim(),
      paymentMethod: paymentMethod.trim(),
      description: description.trim(),
      status,
    }

    onCreate(item)
    toast({ title: t('estimate.createdSuccess'), variant: 'success' })
    onClose()
  }

  return (
    <ModalWrapper
      open={open}
      onClose={onClose}
      title={t('estimate.addModalTitle')}
      description={t('estimate.addModalDescription')}
      size="lg"
      className="bg-white"
      footer={
        <div className="flex gap-2 justify-end">
          <Button type="button" variant="outline" onClick={onClose}>
            {t('estimate.addCancel')}
          </Button>
          <Button
            type="submit"
            form="add-estimate-form"
            className="bg-[#00AB41] hover:bg-[#009638] text-white font-semibold"
            disabled={!canSubmit}
          >
            {t('estimate.addSubmit')}
          </Button>
        </div>
      }
    >
      <form id="add-estimate-form" onSubmit={handleSubmit} className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="est-project">{t('estimate.form.projectName')}</Label>
            <Input
              id="est-project"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder={t('estimate.form.projectNamePlaceholder')}
              className="rounded-lg"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="est-customer">{t('estimate.form.customerName')}</Label>
            <Input
              id="est-customer"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder={t('estimate.form.customerNamePlaceholder')}
              className="rounded-lg"
              required
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="est-location">{t('estimate.form.location')}</Label>
            <Input
              id="est-location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder={t('estimate.form.locationPlaceholder')}
              className="rounded-lg"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="est-from">{t('estimate.form.startDate')}</Label>
            <Input
              id="est-from"
              value={deadlineFrom}
              onChange={(e) => setDeadlineFrom(e.target.value)}
              placeholder={t('estimate.form.startDatePlaceholder')}
              className="rounded-lg"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="est-to">{t('estimate.form.endDate')}</Label>
            <Input
              id="est-to"
              value={deadlineTo}
              onChange={(e) => setDeadlineTo(e.target.value)}
              placeholder={t('estimate.form.endDatePlaceholder')}
              className="rounded-lg"
              required
            />
          </div>
          <div className="space-y-2">
            <Label>{t('estimate.form.paymentMethod')}</Label>
            <Select
              value={paymentMethod || undefined}
              onValueChange={(v) => setPaymentMethod(v as (typeof PAYMENT_OPTIONS)[number])}
            >
              <SelectTrigger className="rounded-lg">
                <SelectValue placeholder={t('estimate.form.paymentMethodPlaceholder')} />
              </SelectTrigger>
              <SelectContent>
                {PAYMENT_OPTIONS.map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>{t('estimate.form.status')}</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as EstimateStatus)}>
              <SelectTrigger className="rounded-lg">
                <SelectValue placeholder={t('estimate.form.statusPlaceholder')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">{t('estimate.status.pending')}</SelectItem>
                <SelectItem value="reviewed">{t('estimate.status.reviewed')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="est-desc">{t('estimate.form.description')}</Label>
          <Input
            id="est-desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t('estimate.form.descriptionPlaceholder')}
            className="rounded-lg"
          />
        </div>
      </form>
    </ModalWrapper>
  )
}

