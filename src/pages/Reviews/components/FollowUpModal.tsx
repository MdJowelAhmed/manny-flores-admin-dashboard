import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Send, Star } from 'lucide-react'
import { ModalWrapper } from '@/components/common'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import type { Review } from '@/types'
import { cn } from '@/utils/cn'
import { toast } from '@/utils/toast'

export type FollowUpActionType =
  | 'apology'
  | 'clarification'
  | 'discount'
  | 'maintenance'

const ACTION_KEYS: FollowUpActionType[] = ['apology', 'clarification', 'discount', 'maintenance']

interface FollowUpModalProps {
  open: boolean
  onClose: () => void
  review: Review | null
}

export function FollowUpModal({ open, onClose, review }: FollowUpModalProps) {
  const { t } = useTranslation()
  const [action, setAction] = useState<FollowUpActionType>('apology')
  const [message, setMessage] = useState('')
  const [notifyManager, setNotifyManager] = useState(true)

  useEffect(() => {
    if (open && review) {
      setAction('apology')
      setNotifyManager(true)
      setMessage(
        t('reviews.followUpMessageTemplate', {
          name: review.customerName,
          project: review.projectName,
        })
      )
    }
  }, [open, review?.id, review?.customerName, review?.projectName, t])

  if (!review) return null

  const handleSend = () => {
    toast({
      title: t('common.success'),
      description: t('reviews.followUpSent'),
      variant: 'success',
    })
    onClose()
  }

  return (
    <ModalWrapper
      open={open}
      onClose={onClose}
      title={t('reviews.followUpTitle')}
      description={t('reviews.followUpSubtitle', {
        caseId: review.caseId ?? review.id,
        name: review.customerName.toUpperCase(),
      })}
      size="lg"
      className="max-w-lg bg-white sm:rounded-2xl"
      footer={
        <div className="flex flex-col-reverse sm:flex-row gap-3 sm:justify-end w-full">
          <Button type="button" variant="outline" className="rounded-lg border-gray-200" onClick={onClose}>
            {t('reviews.discard')}
          </Button>
          <Button
            type="button"
            className="rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
            onClick={handleSend}
          >
            <Send className="h-4 w-4" />
            {t('reviews.sendSmsEmail')}
          </Button>
        </div>
      }
    >
      <div className="space-y-5 -mt-1">
        <div className="rounded-xl border border-orange-200 bg-orange-50/90 px-4 py-3">
          <p className="text-[11px] font-bold tracking-wide text-orange-700 uppercase mb-2">
            {t('reviews.customerFeedbackLabel')}
          </p>
          <p className="text-sm text-foreground leading-relaxed">{review.feedback}</p>
          <div className="flex gap-0.5 mt-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star
                key={i}
                className={cn(
                  'h-5 w-5',
                  i <= review.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'
                )}
              />
            ))}
          </div>
        </div>

        <div>
          <p className="text-[11px] font-bold tracking-wide text-foreground/80 uppercase mb-2">
            {t('reviews.selectActionType')}
          </p>
          <div className="flex flex-wrap gap-2">
            {ACTION_KEYS.map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setAction(key)}
                className={cn(
                  'rounded-full px-3 py-2 text-xs font-medium border transition-colors',
                  action === key
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-white text-muted-foreground border-gray-200 hover:bg-muted/50'
                )}
              >
                {t(`reviews.followUpAction.${key}`)}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-[11px] font-bold tracking-wide text-foreground/80 uppercase mb-2">
            {t('reviews.messageContent')}
          </p>
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="min-h-[120px] rounded-xl bg-muted/40 border-gray-200/80 text-sm"
            rows={5}
          />
        </div>

        <label className="flex items-center gap-2 cursor-pointer">
          <Checkbox checked={notifyManager} onCheckedChange={(v) => setNotifyManager(v === true)} />
          <span className="text-sm text-foreground">{t('reviews.notifyAccountManager')}</span>
        </label>
      </div>
    </ModalWrapper>
  )
}
