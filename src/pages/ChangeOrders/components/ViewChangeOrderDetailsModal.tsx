import { useTranslation } from 'react-i18next'
import {
  CalendarDays,
  CircleDollarSign,
  Info,
  Paperclip,
  User,
  Download,
  AlertCircle,
  BadgeCheck,
} from 'lucide-react'
import { ModalWrapper } from '@/components/common'
import { Button } from '@/components/ui/button'
import type { ChangeOrder } from '../changeOrdersData'
import { formatCurrency } from '@/utils/formatters'
import { cn } from '@/utils/cn'
import { toast } from '@/utils/toast'

interface ViewChangeOrderDetailsModalProps {
  open: boolean
  onClose: () => void
  order: ChangeOrder | null
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
    <div className="flex justify-between items-start gap-4 py-2.5 border-b border-gray-100 last:border-0">
      <span className="text-sm text-muted-foreground shrink-0">{label}:</span>
      <span className={cn('text-sm font-medium text-foreground text-right', valueClassName)}>
        {typeof value === 'number' ? formatCurrency(value) : value}
      </span>
    </div>
  )
}

function SectionHeader({ icon: Icon, title }: { icon: React.ElementType; title: string }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <div className="p-1.5 rounded-lg bg-primary/10">
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
    </div>
  )
}

export function ViewChangeOrderDetailsModal({
  open,
  onClose,
  order,
}: ViewChangeOrderDetailsModalProps) {
  const { t } = useTranslation()
  if (!order) return null

  const handleSendToClient = () => {
    toast({
      title: t('common.success'),
      description: t('changeOrders.sentToClient'),
      variant: 'success',
    })
    onClose()
  }

  const downloadFile = (fileName: string) => {
    const blob = new Blob([`${fileName}\n${t('changeOrders.attachmentPlaceholder')}`], {
      type: 'text/plain',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = fileName
    a.click()
    URL.revokeObjectURL(url)
    toast({
      title: t('common.success'),
      description: t('changeOrders.downloadStarted', { name: fileName }),
      variant: 'success',
    })
  }

  return (
    <ModalWrapper
      open={open}
      onClose={onClose}
      title={order.orderId}
      description={t('changeOrders.detailsSubtitle')}
      size="xl"
      className="max-w-2xl bg-white sm:rounded-2xl"
      footer={
        <div className="flex flex-col-reverse sm:flex-row gap-3 sm:justify-end w-full">
          <Button type="button" variant="outline" className="rounded-lg border-gray-200" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button
            type="button"
            className="rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground"
            onClick={handleSendToClient}
          >
            {t('changeOrders.sendToClient')}
          </Button>
        </div>
      }
    >
      <div className="space-y-6 -mt-1">
        <div>
          <SectionHeader icon={CalendarDays} title={t('changeOrders.sectionProjectInfo')} />
          <div className="rounded-xl border border-gray-100 bg-muted/20 px-4">
            <DetailRow label={t('changeOrders.projectName')} value={order.projectName} />
            <DetailRow label={t('changeOrders.projectId')} value={order.projectId} />
            <DetailRow label={t('changeOrders.siteAddress')} value={order.siteAddress} />
            <DetailRow label={t('changeOrders.requestDate')} value={order.requestDate} />
          </div>
        </div>

        <div>
          <SectionHeader icon={CircleDollarSign} title={t('changeOrders.sectionFinancialImpact')} />
          <div className="rounded-xl border border-gray-100 bg-muted/20 px-4">
            <DetailRow label={t('changeOrders.originalCost')} value={order.originalCost} />
            <DetailRow
              label={t('changeOrders.additionalCost')}
              value={`+${formatCurrency(order.additionalCost)}`}
              valueClassName="text-orange-600 font-semibold"
            />
            <DetailRow
              label={t('changeOrders.newTotal')}
              value={order.newTotal}
              valueClassName="text-primary font-semibold"
            />
          </div>
        </div>

        <div>
          <SectionHeader icon={User} title={t('changeOrders.sectionCustomerInfo')} />
          <div className="rounded-xl border border-gray-100 bg-muted/20 px-4">
            <DetailRow label={t('changeOrders.customerName')} value={order.customerName} />
            <DetailRow label={t('changeOrders.contactNumber')} value={order.contactNumber} />
            <DetailRow label={t('changeOrders.emailField')} value={order.email} />
            <DetailRow label={t('changeOrders.company')} value={order.company} />
          </div>
        </div>

        <div>
          <SectionHeader icon={Info} title={t('changeOrders.reasonForChange')} />
          <p className="text-sm text-muted-foreground leading-relaxed rounded-xl border border-gray-100 bg-white px-4 py-3">
            {order.reasonForChange}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <SectionHeader icon={Paperclip} title={t('changeOrders.attachments')} />
            <div className="rounded-xl border border-gray-100 bg-white divide-y divide-gray-100">
              {order.attachments.length === 0 ? (
                <p className="text-sm text-muted-foreground px-4 py-3">{t('changeOrders.noAttachments')}</p>
              ) : (
                order.attachments.map((a) => (
                  <div key={a.name} className="flex items-center justify-between gap-2 px-4 py-2.5">
                    <span className="text-sm font-medium text-foreground truncate">{a.name}</span>
                    <button
                      type="button"
                      onClick={() => downloadFile(a.name)}
                      className="shrink-0 p-2 rounded-lg text-primary hover:bg-primary/10"
                      aria-label={t('changeOrders.downloadFile', { name: a.name })}
                    >
                      <Download className="h-4 w-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          <div>
            <SectionHeader icon={BadgeCheck} title={t('changeOrders.authorization')} />
            {order.status === 'Pending' ? (
              <div className="rounded-xl border border-amber-200 bg-amber-50/80 px-4 py-3 flex gap-3">
                <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-amber-900">
                    {t('changeOrders.pendingAuthorization')}
                  </p>
                  <p className="text-xs text-amber-800/80 mt-1">{t('changeOrders.clientSignatureRequired')}</p>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-primary/30 bg-primary/5 px-4 py-3 flex gap-3">
                <BadgeCheck className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <p className="text-sm font-semibold text-primary">{t('changeOrders.authorized')}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </ModalWrapper>
  )
}
