import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ModalWrapper } from '@/components/common'
import { FormInput, FormTextarea } from '@/components/common/Form'
import { Button } from '@/components/ui/button'
import { DatePicker } from '@/components/common/Form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from '@/utils/toast'
import { useCreatePurchaseOrderMutation } from '@/redux/slices/super-admin/purchaseOrdersApi'
import { useGetBuildersQuery } from '@/redux/slices/super-admin/employeeManagement'
import { useGetCompanyProjectsQuery } from '@/redux/api/companyProjectApi'

const inputClass = 'rounded-lg bg-muted/40 border-gray-200/80 h-11'

interface NewPurchaseOrderModalProps {
  open: boolean
  onClose: () => void
  onCreated: () => void
}

export function NewPurchaseOrderModal({ open, onClose, onCreated }: NewPurchaseOrderModalProps) {
  const { t } = useTranslation()
  const [builderId, setBuilderId] = useState('')
  const [companyProjectId, setCompanyProjectId] = useState('')
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined)
  const [notes, setNotes] = useState('')

  const [createPurchaseOrder, { isLoading }] = useCreatePurchaseOrderMutation()
  const { data: buildersRes } = useGetBuildersQuery({ page: 1, limit: 100 }, { skip: !open })
  const { data: projectsRes } = useGetCompanyProjectsQuery(
    { page: 1, limit: 100 },
    { skip: !open }
  )

  const builders = buildersRes?.data ?? []
  const projects = (projectsRes?.data ?? []).filter(
    (p) => !builderId || p.builderId === builderId
  )

  useEffect(() => {
    if (!open) return
    setBuilderId('')
    setCompanyProjectId('')
    setDescription('')
    setAmount('')
    setDueDate(undefined)
    setNotes('')
  }, [open])

  useEffect(() => {
    setCompanyProjectId('')
  }, [builderId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!builderId) {
      toast({
        title: t('common.error'),
        description: t('purchaseOrders.builderRequired'),
        variant: 'destructive',
      })
      return
    }

    const parsedAmount = Number.parseFloat(amount.replace(/[^0-9.-]/g, '')) || 0
    if (parsedAmount <= 0) {
      toast({
        title: t('common.error'),
        description: t('purchaseOrders.amountRequired'),
        variant: 'destructive',
      })
      return
    }

    try {
      await createPurchaseOrder({
        builderId,
        companyProjectId: companyProjectId || undefined,
        description: description.trim(),
        amount: parsedAmount,
        dueDate: dueDate ? dueDate.toISOString() : null,
        notes: notes.trim() || undefined,
      }).unwrap()

      toast({
        title: t('common.success'),
        description: t('purchaseOrders.createdSuccess'),
        variant: 'success',
      })
      onCreated()
      onClose()
    } catch (err: unknown) {
      const message =
        err &&
        typeof err === 'object' &&
        'data' in err &&
        err.data &&
        typeof err.data === 'object' &&
        'message' in err.data &&
        typeof err.data.message === 'string'
          ? err.data.message
          : t('purchaseOrders.createFailed')
      toast({ title: t('common.error'), description: message, variant: 'destructive' })
    }
  }

  return (
    <ModalWrapper
      open={open}
      onClose={onClose}
      title={t('purchaseOrders.newPurchaseOrder')}
      description={t('purchaseOrders.newPurchaseOrderDesc')}
      size="lg"
      className="max-w-2xl bg-white"
      footer={
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
            {t('common.cancel')}
          </Button>
          <Button
            type="submit"
            form="new-purchase-order-form"
            className="bg-primary hover:bg-primary/90 text-white"
            disabled={isLoading}
          >
            {t('purchaseOrders.generatePo')}
          </Button>
        </div>
      }
    >
      <form id="new-purchase-order-form" onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">{t('purchaseOrders.selectBuilder')}</label>
          <Select value={builderId} onValueChange={setBuilderId}>
            <SelectTrigger className={inputClass}>
              <SelectValue placeholder={t('purchaseOrders.selectBuilderPlaceholder')} />
            </SelectTrigger>
            <SelectContent>
              {builders.map((builder: { id: string; name?: string; email?: string }) => (
                <SelectItem key={builder.id} value={builder.id}>
                  {builder.name || builder.email}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">{t('purchaseOrders.selectProject')}</label>
          <Select value={companyProjectId} onValueChange={setCompanyProjectId}>
            <SelectTrigger className={inputClass}>
              <SelectValue placeholder={t('purchaseOrders.selectProjectPlaceholder')} />
            </SelectTrigger>
            <SelectContent>
              {projects.map((project) => (
                <SelectItem key={project.id} value={project.id}>
                  {project.projectName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <FormInput
          label={t('purchaseOrders.amount')}
          placeholder={t('purchaseOrders.amountPlaceholder')}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className={inputClass}
        />

        <DatePicker
          label={t('purchaseOrders.dueDate')}
          value={dueDate}
          onChange={setDueDate}
        />

        <FormTextarea
          label={t('purchaseOrders.description')}
          placeholder={t('purchaseOrders.descriptionPlaceholder')}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
        />

        <FormTextarea
          label={t('purchaseOrders.notes')}
          placeholder={t('purchaseOrders.notesPlaceholder')}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
        />
      </form>
    </ModalWrapper>
  )
}
