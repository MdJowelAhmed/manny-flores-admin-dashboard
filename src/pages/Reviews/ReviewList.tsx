import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { RefreshCw, Smartphone, Bell, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { ReviewCard } from './components/ReviewCard'
import { FollowUpModal } from './components/FollowUpModal'
import { mockReviewsData, reviewPlatformStats } from './reviewData'
import type { Review } from '@/types'
import { toast } from '@/utils/toast'
import { cn } from '@/utils/cn'

function AutomationBanner() {
  const { t } = useTranslation()
  return (
    <div
      className={cn(
        'flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4',
        'rounded-xl border border-gray-200/90 bg-white p-4 sm:p-5 shadow-sm'
      )}
    >
      <div className="flex gap-3 min-w-0">
        <div className="h-10 w-10 shrink-0 rounded-full bg-primary/15 flex items-center justify-center">
          <RefreshCw className="h-5 w-5 text-primary" />
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-foreground">{t('reviews.automationTriggerActive')}</p>
          <p className="text-sm text-muted-foreground mt-0.5">{t('reviews.automationTriggerDesc')}</p>
        </div>
      </div>
      <Button
        type="button"
        variant="outline"
        className="shrink-0 h-10 rounded-lg border-primary/25 text-primary hover:bg-primary/5"
      >
        <Smartphone className="h-4 w-4 mr-2" />
        {t('reviews.automationTriggerActive')}
      </Button>
    </div>
  )
}

export default function ReviewList() {
  const { t } = useTranslation()
  const [reviews, setReviews] = useState<Review[]>(mockReviewsData)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [reviewToDelete, setReviewToDelete] = useState<Review | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [followUpReview, setFollowUpReview] = useState<Review | null>(null)

  const queueReviews = useMemo(() => reviews.filter((r) => r.status !== 'Rejected'), [reviews])

  const stats = useMemo(() => {
    const pending = reviews.filter((r) => r.status === 'Pending').length
    const rated = reviews.filter((r) => r.rating > 0)
    const avg =
      rated.length > 0
        ? rated.reduce((s, r) => s + r.rating, 0) / rated.length
        : 4.4
    return {
      pendingApproval: pending,
      publishedGoogle: reviewPlatformStats.publishedGoogle,
      internalOnly: reviewPlatformStats.internalOnly,
      avgRating: Math.round(avg * 10) / 10,
    }
  }, [reviews])

  const handleApprovePush = (review: Review) => {
    setReviews((prev) =>
      prev.map((r) => (r.id === review.id ? { ...r, status: 'Approved' as const } : r))
    )
    toast({
      variant: 'success',
      title: t('reviews.approvePushSuccess'),
      description: t('reviews.approvePushDesc', { name: review.customerName }),
    })
  }

  const handleRejectClick = (review: Review) => {
    setReviewToDelete(review)
    setIsConfirmOpen(true)
  }

  const handleConfirmReject = async () => {
    if (!reviewToDelete) return
    setIsDeleting(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 300))
      setReviews((prev) => prev.filter((r) => r.id !== reviewToDelete.id))
      toast({
        variant: 'success',
        title: t('reviews.rejectedInternalTitle'),
        description: t('reviews.rejectedInternalDesc', { name: reviewToDelete.customerName }),
      })
      setIsConfirmOpen(false)
      setReviewToDelete(null)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleConfigureRecipients = () => {
    toast({
      title: t('reviews.configureRecipients'),
      description: t('reviews.configureRecipientsHint'),
      variant: 'default',
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 min-h-[60vh] -mx-4 sm:mx-0"
    >
      <AutomationBanner />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {(
          [
            { key: 'pendingApproval', value: stats.pendingApproval, isRating: false },
            { key: 'publishedGoogle', value: stats.publishedGoogle, isRating: false },
            { key: 'internalOnly', value: stats.internalOnly, isRating: false },
            { key: 'avgRating', value: stats.avgRating, isRating: true },
          ] as const
        ).map((item, index) => (
          <motion.div
            key={item.key}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.04 * index }}
            className="rounded-xl border border-gray-200/90 bg-white p-5 shadow-sm"
          >
            <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              {t(`reviews.stat.${item.key}`)}
            </p>
            <p className="text-2xl font-bold text-foreground mt-2 tabular-nums">
              {item.isRating ? Number(item.value).toFixed(1) : item.value}
            </p>
          </motion.div>
        ))}
      </div>

      {/* <AutomationBanner /> */}

      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-xl sm:text-2xl font-bold text-foreground">
          {t('reviews.approvalQueueTitle')}
        </h1>
        <span className="text-xs font-bold uppercase tracking-wide px-2.5 py-1 rounded-md bg-amber-100 text-amber-800">
          {t('reviews.actionRequired')}
        </span>
      </div>

      <div className="space-y-4">
        {queueReviews.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-200 bg-white/80 py-16 text-center text-muted-foreground text-sm">
            {t('reviews.noReviewsFound')}
          </div>
        ) : (
          queueReviews.map((review, index) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.04 * index }}
            >
              <ReviewCard
                review={review}
                onApprovePush={() => handleApprovePush(review)}
                onRejectInternal={() => handleRejectClick(review)}
                onFollowUp={() => setFollowUpReview(review)}
              />
            </motion.div>
          ))
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-2 pt-2">
        <div className="rounded-xl bg-slate-900 text-white p-5 sm:p-6 shadow-md border border-slate-800">
          <div className="flex items-start justify-between gap-3">
            <div className="flex gap-3 w-full">
              <div className="h-11 w-11 rounded-lg bg-blue-500/20 flex items-center justify-center text-lg font-bold text-blue-300">
                <Search className="h-5 w-5 text-blue-300" />
              </div>
              <div className="flex justify-between items-center w-full">
                <h3 className="font-semibold text-white">{t('reviews.gmbTitle')}</h3>
                <span className="inline-block mt-2 text-xs font-bold px-2 py-1 rounded bg-primary text-white">
                  {t('reviews.gmbConnected')}
                </span>
              </div>
            </div>
          </div>
          <p className="text-sm text-slate-300 mt-4 leading-relaxed">{t('reviews.gmbDescription')}</p>
        </div>

        <div className="rounded-xl border border-gray-200/90 bg-white p-5 sm:p-6 shadow-sm">
          <div className="flex gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
              <Bell className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{t('reviews.notificationAlerts')}</h3>
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                {t('reviews.notificationAlertsDesc')}
              </p>
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            className="w-full mt-5 rounded-lg border-primary text-primary hover:bg-primary/5"
            onClick={handleConfigureRecipients}
          >
            {t('reviews.configureRecipients')}
          </Button>
        </div>
      </div>

      <FollowUpModal
        open={!!followUpReview}
        onClose={() => setFollowUpReview(null)}
        review={followUpReview}
      />

      <ConfirmDialog
        open={isConfirmOpen}
        onClose={() => {
          setIsConfirmOpen(false)
          setReviewToDelete(null)
        }}
        onConfirm={handleConfirmReject}
        title={t('reviews.rejectInternal')}
        description={t('reviews.rejectInternalConfirm', { name: reviewToDelete?.customerName ?? '' })}
        confirmText={t('reviews.reject')}
        variant="danger"
        isLoading={isDeleting}
      />
    </motion.div>
  )
}
