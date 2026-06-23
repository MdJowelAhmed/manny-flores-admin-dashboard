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
import {
  getChangeOrderProjectName,
  getChangeOrderStatus,
  getChangeOrderSiteAddress,
  getChangeOrderCustomerName,
  getChangeOrderCustomerEmail,
  getChangeOrderCustomerPhone,
  getChangeOrderCompany,
  getChangeOrderType,
} from '../changeOrdersData'
import { formatCurrency } from '@/utils/formatters'
import { cn } from '@/utils/cn'
import { toast } from '@/utils/toast'
import { imageUrl } from '@/redux/baseApi'

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
    <div className="flex justify-between items-start gap-4 py-2.5 last:border-0 border-b border-gray-100/50">
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

  const downloadFile = (filePath: string) => {
    const fullUrl = filePath.startsWith('http') ? filePath : `${imageUrl}${filePath}`
    const fileName = filePath.split('/').pop() || 'attachment'
    const a = document.createElement('a')
    a.href = fullUrl
    a.target = '_blank'
    a.download = fileName
    a.click()
    toast({
      title: t('common.success'),
      description: t('changeOrders.downloadStarted', { name: fileName }),
      variant: 'success',
    })
  }

  const currentStatus = getChangeOrderStatus(order)
  const isCompanyOrder = getChangeOrderType(order) === 'company'

  return (
    <ModalWrapper
      open={open}
      onClose={onClose}
      title={`Change Order Details`}
      description={t('changeOrders.detailsSubtitle')}
      size="xl"
      className="max-w-3xl bg-white "
      footer={
        <div className="flex flex-col-reverse sm:flex-row gap-3 sm:justify-end w-full">
          <Button
            type="button"
            className="rounded-lg bg-primary hover:bg-primary/90 text-white"
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
          <div className="rounded-xl bg-muted/20 px-4 py-1">
            <DetailRow
              label={t('changeOrders.projectName')}
              value={getChangeOrderProjectName(order)}
            />
            <DetailRow label={t('changeOrders.siteAddress')} value={getChangeOrderSiteAddress(order)} />
            <DetailRow
              label={t('changeOrders.requestDate')}
              value={
                order.createdAt
                  ? new Date(order.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })
                  : '—'
              }
            />
          </div>
        </div>

        <div>
          <SectionHeader icon={CircleDollarSign} title={t('changeOrders.sectionFinancialImpact')} />
          <div className="rounded-xl bg-muted/20 px-4 py-1">
            <DetailRow label={t('changeOrders.originalCost')} value={order.originalCost ?? 0} />
            <DetailRow
              label={t('changeOrders.additionalCost')}
              value={`+${formatCurrency(order.additionalCost ?? 0)}`}
              valueClassName="text-orange-600 font-semibold"
            />
            <DetailRow
              label={t('changeOrders.newTotal')}
              value={order.totalCost ?? ((order.originalCost ?? 0) + (order.additionalCost ?? 0))}
              valueClassName="text-primary font-semibold"
            />
          </div>
        </div>

        <div>
          <SectionHeader
            icon={User}
            title={
              isCompanyOrder
                ? t('changeOrders.sectionBuilderInfo')
                : t('changeOrders.sectionCustomerInfo')
            }
          />
          <div className="rounded-xl bg-muted/20 px-4 py-1">
            <DetailRow
              label={
                isCompanyOrder ? t('changeOrders.builderName') : t('changeOrders.customerName')
              }
              value={getChangeOrderCustomerName(order)}
            />
            {!isCompanyOrder ? (
              <DetailRow
                label={t('changeOrders.contactNumber')}
                value={getChangeOrderCustomerPhone(order)}
              />
            ) : null}
            <DetailRow label={t('changeOrders.emailField')} value={getChangeOrderCustomerEmail(order)} />
            <DetailRow label={t('changeOrders.company')} value={getChangeOrderCompany(order)} />
          </div>
        </div>

        <div>
          <SectionHeader icon={Info} title={t('changeOrders.reasonForChange')} />
          <div className="rounded-xl bg-muted/20 px-4 py-3 space-y-2 border border-gray-100">
            <p className="text-sm font-semibold text-foreground capitalize">
              {order.reasonForChange ? order.reasonForChange.replace(/_/g, ' ') : '—'}
            </p>
            {order.description && (
              <p className="text-sm text-muted-foreground leading-relaxed">
                {order.description}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <SectionHeader icon={Paperclip} title={t('changeOrders.attachments')} />
            <div className="rounded-xl bg-white border border-gray-100 divide-y divide-gray-100 overflow-hidden">
              {!order.documentation || order.documentation.length === 0 ? (
                <p className="text-sm text-muted-foreground px-4 py-3">{t('changeOrders.noAttachments')}</p>
              ) : (
                order.documentation.map((filePath) => {
                  const fileName = filePath.split('/').pop() || 'attachment'
                  return (
                    <div key={filePath} className="flex items-center justify-between gap-2 px-4 py-2.5">
                      <span className="text-sm font-medium text-foreground truncate max-w-[200px]" title={fileName}>
                        {fileName}
                      </span>
                      <button
                        type="button"
                        onClick={() => downloadFile(filePath)}
                        className="shrink-0 p-2 rounded-lg text-primary hover:bg-primary/10"
                        aria-label={t('changeOrders.downloadFile', { name: fileName })}
                      >
                        <Download className="h-4 w-4" />
                      </button>
                    </div>
                  )
                })
              )}
            </div>
          </div>

          <div>
            <SectionHeader icon={BadgeCheck} title={t('changeOrders.authorization')} />
            {currentStatus === 'Pending' ? (
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
