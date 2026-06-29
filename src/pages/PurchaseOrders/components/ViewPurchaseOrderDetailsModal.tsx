import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Receipt, User, History, Wallet } from 'lucide-react'
import { ModalWrapper } from '@/components/common'
import { FormInput } from '@/components/common/Form'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { formatCurrency, formatDate } from '@/utils/formatters'
import { cn } from '@/utils/cn'
import { toast } from '@/utils/toast'
import {
  useRecordPurchaseOrderPaymentMutation,
  useUpdatePurchaseOrderStatusMutation,
} from '@/redux/slices/super-admin/purchaseOrdersApi'
import {
  getOrderAmountPaid,
  getOrderRemainingDue,
  getPurchaseOrderBuilderEmail,
  getPurchaseOrderBuilderName,
  getPurchaseOrderNumber,
  getPurchaseOrderProjectName,
  getPurchaseOrderStatusClass,
  getPurchaseOrderStatusLabel,
  normalizePurchaseOrderStatus,
  purchaseOrderPaymentMethods,
  statusUpdateOptions,
  type PurchaseOrder,
  type PurchaseOrderStatus,
} from '../purchaseOrdersData'

interface ViewPurchaseOrderDetailsModalProps {
  open: boolean
  onClose: () => void
  order: PurchaseOrder | null
  canManageStatus?: boolean
  canRecordPayment?: boolean
  onUpdated?: () => void
}

function DetailRow({
  label,
  value,
  valueClassName,
}: {
  label: string
  value: string | number
  valueClassName?: string
}) {
  return (
    <div className="flex justify-between items-start gap-4 border-b border-gray-100/50 py-2.5 last:border-0">
      <span className="shrink-0 text-sm text-muted-foreground">{label}:</span>
      <span className={cn('text-right text-sm font-medium text-foreground', valueClassName)}>
        {typeof value === 'number' ? formatCurrency(value) : value}
      </span>
    </div>
  )
}

export function ViewPurchaseOrderDetailsModal({
  open,
  onClose,
  order,
  canManageStatus = false,
  canRecordPayment = false,
  onUpdated,
}: ViewPurchaseOrderDetailsModalProps) {
  const { t } = useTranslation()
  const [status, setStatus] = useState<PurchaseOrderStatus>('PENDING')
  const [paymentAmount, setPaymentAmount] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('BANK_TRANSFER')
  const [paymentNote, setPaymentNote] = useState('')

  const [updateStatus, { isLoading: isUpdatingStatus }] = useUpdatePurchaseOrderStatusMutation()
  const [recordPayment, { isLoading: isRecordingPayment }] =
    useRecordPurchaseOrderPaymentMutation()

  useEffect(() => {
    if (open && order) {
      setStatus(normalizePurchaseOrderStatus(order.status))
      const remaining = getOrderRemainingDue(order)
      setPaymentAmount(remaining > 0 ? String(remaining) : '')
      setPaymentMethod('BANK_TRANSFER')
      setPaymentNote('')
    }
  }, [open, order])

  if (!order) return null

  const currentStatus = normalizePurchaseOrderStatus(order.status)
  const paymentHistory = order.paymentHistory ?? []
  const totalPaid = getOrderAmountPaid(order)
  const remainingDue = getOrderRemainingDue(order)
  const showPaymentForm =
    canRecordPayment && currentStatus === 'SENT' && remainingDue > 0

  const handleSaveStatus = async () => {
    if (status === currentStatus) return
    try {
      await updateStatus({ id: order.id, status }).unwrap()
      toast({
        title: t('common.success'),
        description: t('purchaseOrders.statusUpdated'),
        variant: 'success',
      })
      onUpdated?.()
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
          : t('purchaseOrders.statusUpdateFailed')
      toast({ title: t('common.error'), description: message, variant: 'destructive' })
    }
  }

  const handleRecordPayment = async () => {
    const parsedAmount = Number.parseFloat(paymentAmount.replace(/[^0-9.-]/g, '')) || 0
    if (parsedAmount <= 0 || parsedAmount > remainingDue) {
      toast({
        title: t('common.error'),
        description: t('purchaseOrders.invalidPaymentAmount'),
        variant: 'destructive',
      })
      return
    }

    try {
      await recordPayment({
        id: order.id,
        amount: parsedAmount,
        method: paymentMethod,
        note: paymentNote.trim() || undefined,
      }).unwrap()
      toast({
        title: t('common.success'),
        description: t('purchaseOrders.paymentRecorded'),
        variant: 'success',
      })
      onUpdated?.()
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
          : t('purchaseOrders.paymentRecordFailed')
      toast({ title: t('common.error'), description: message, variant: 'destructive' })
    }
  }

  const isLoading = isUpdatingStatus || isRecordingPayment

  return (
    <ModalWrapper
      open={open}
      onClose={onClose}
      title={t('purchaseOrders.detailsTitle')}
      description={getPurchaseOrderNumber(order)}
      size="xl"
      className="max-w-3xl bg-white"
      footer={
        canManageStatus ? (
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-end">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              {t('common.close')}
            </Button>
            <Button
              type="button"
              className="bg-primary hover:bg-primary/90 text-white"
              onClick={handleSaveStatus}
              disabled={isLoading || status === currentStatus}
            >
              {t('purchaseOrders.updateStatus')}
            </Button>
          </div>
        ) : (
          <div className="flex justify-end">
            <Button type="button" onClick={onClose} className="bg-primary hover:bg-primary/90 text-white">
              {t('common.close')}
            </Button>
          </div>
        )
      }
    >
      <div className="space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-foreground">{getPurchaseOrderProjectName(order)}</h3>
            <p className="mt-0.5 text-sm text-muted-foreground">{getPurchaseOrderBuilderName(order)}</p>
          </div>
          <span
            className={cn(
              'shrink-0 rounded-md px-3 py-1 text-xs font-semibold',
              getPurchaseOrderStatusClass(order.status)
            )}
          >
            {getPurchaseOrderStatusLabel(order.status)}
          </span>
        </div>

        <div className="rounded-xl border border-gray-200 p-4">
          <div className="mb-3 flex items-center gap-2">
            <div className="rounded-lg bg-primary/10 p-1.5">
              <Receipt className="h-4 w-4 text-primary" />
            </div>
            <h4 className="text-sm font-semibold">{t('purchaseOrders.poInformation')}</h4>
          </div>
          <DetailRow label={t('purchaseOrders.poNumber')} value={getPurchaseOrderNumber(order)} />
          <DetailRow label={t('purchaseOrders.amount')} value={order.amount} valueClassName="text-primary" />
          <DetailRow label={t('purchaseOrders.totalPaid')} value={totalPaid} />
          <DetailRow
            label={t('purchaseOrders.remainingDue')}
            value={remainingDue}
            valueClassName="text-amber-700"
          />
          <DetailRow
            label={t('purchaseOrders.dueDate')}
            value={order.dueDate ? formatDate(order.dueDate) : '—'}
          />
          <DetailRow
            label={t('purchaseOrders.createdAt')}
            value={order.createdAt ? formatDate(order.createdAt) : '—'}
          />
          {order.paidAt ? (
            <DetailRow label={t('purchaseOrders.paidAt')} value={formatDate(order.paidAt)} />
          ) : null}
          {order.description ? (
            <DetailRow label={t('purchaseOrders.description')} value={order.description} />
          ) : null}
          {order.notes ? <DetailRow label={t('purchaseOrders.notes')} value={order.notes} /> : null}
        </div>

        <div className="rounded-xl border border-gray-200 p-4">
          <div className="mb-3 flex items-center gap-2">
            <div className="rounded-lg bg-primary/10 p-1.5">
              <User className="h-4 w-4 text-primary" />
            </div>
            <h4 className="text-sm font-semibold">{t('purchaseOrders.builderInformation')}</h4>
          </div>
          <DetailRow label={t('purchaseOrders.builderName')} value={getPurchaseOrderBuilderName(order)} />
          <DetailRow label={t('common.email')} value={getPurchaseOrderBuilderEmail(order)} />
        </div>

        {canManageStatus ? (
          <div className="rounded-xl border border-gray-200 p-4">
            <label className="mb-2 block text-sm font-medium">{t('purchaseOrders.updateStatus')}</label>
            <p className="mb-3 text-xs text-muted-foreground">{t('purchaseOrders.statusHint')}</p>
            <Select value={status} onValueChange={(v) => setStatus(v as PurchaseOrderStatus)}>
              <SelectTrigger className="h-11 rounded-lg">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statusUpdateOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {t(opt.labelKey)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : null}

        {showPaymentForm ? (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4">
            <div className="mb-3 flex items-center gap-2">
              <div className="rounded-lg bg-emerald-100 p-1.5">
                <Wallet className="h-4 w-4 text-emerald-700" />
              </div>
              <h4 className="text-sm font-semibold text-emerald-900">
                {t('purchaseOrders.recordPayment')}
              </h4>
            </div>
            <p className="mb-4 text-xs text-emerald-800">{t('purchaseOrders.recordPaymentHint')}</p>
            <div className="space-y-3">
              <FormInput
                label={t('purchaseOrders.paymentAmount')}
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                placeholder={formatCurrency(remainingDue)}
              />
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('purchaseOrders.paymentMethod')}</label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger className="h-11 rounded-lg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {purchaseOrderPaymentMethods.map((method) => (
                      <SelectItem key={method.value} value={method.value}>
                        {t(method.labelKey)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <FormInput
                label={t('purchaseOrders.paymentNote')}
                value={paymentNote}
                onChange={(e) => setPaymentNote(e.target.value)}
                placeholder={t('purchaseOrders.paymentNotePlaceholder')}
              />
              <Button
                type="button"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                onClick={handleRecordPayment}
                disabled={isRecordingPayment}
              >
                {t('purchaseOrders.submitPayment')}
              </Button>
            </div>
          </div>
        ) : null}

        <div className="rounded-xl border border-gray-200 p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-primary/10 p-1.5">
                <History className="h-4 w-4 text-primary" />
              </div>
              <h4 className="text-sm font-semibold">{t('purchaseOrders.paymentHistory')}</h4>
            </div>
            <span className="text-sm font-semibold text-emerald-700">
              {t('purchaseOrders.totalSettled')}: {formatCurrency(totalPaid)}
            </span>
          </div>

          {paymentHistory.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t('purchaseOrders.noPaymentHistory')}</p>
          ) : (
            <div className="overflow-hidden rounded-lg border border-gray-100">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="bg-muted/40 text-left text-xs font-semibold text-muted-foreground">
                    <th className="px-4 py-3">{t('purchaseOrders.paidAt')}</th>
                    <th className="px-4 py-3">{t('purchaseOrders.paymentMethod')}</th>
                    <th className="px-4 py-3 text-right">{t('purchaseOrders.amount')}</th>
                  </tr>
                </thead>
                <tbody>
                  {paymentHistory.map((payment) => (
                    <tr key={payment.id} className="border-t border-gray-100">
                      <td className="px-4 py-3">{formatDate(payment.paidAt)}</td>
                      <td className="px-4 py-3">{payment.method || '—'}</td>
                      <td className="px-4 py-3 text-right font-medium">
                        {formatCurrency(payment.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </ModalWrapper>
  )
}
