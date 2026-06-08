import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { RefreshCw, Smartphone, Bell, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { ReviewCard } from './components/ReviewCard'
import { toast } from '@/utils/toast'
import { cn } from '@/utils/cn'

import {
  useAllReviewsQuery,
  useUpdateReviewsMutation,
  useReviewOverviewQuery,
} from '@/redux/slices/super-admin/reviewApi'

/* =========================
   Automation Banner
========================= */
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
          <p className="font-semibold text-foreground">
            {t('reviews.automationTriggerActive')}
          </p>
          <p className="text-sm text-muted-foreground mt-0.5">
            {t('reviews.automationTriggerDesc')}
          </p>
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

/* =========================
   MAIN PAGE
========================= */
export default function ReviewList() {
  const { t } = useTranslation()

  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [reviewToAction, setReviewToAction] = useState<any>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  /* =========================
     API CALLS
  ========================= */
  const { data: reviewsData, isLoading } = useAllReviewsQuery({
    page: '1',
    limit: '10',
  })

  const { data: overview } = useReviewOverviewQuery()

  const [updateReviews] = useUpdateReviewsMutation()

  /* =========================
     NORMALIZE DATA
  ========================= */
  const reviews = useMemo(() => {
    return reviewsData?.data || []
  }, [reviewsData])

  /* =========================
     STATS FROM API
  ========================= */
  const stats = useMemo(() => {
    return {
      pendingApproval: overview?.data?.pendingReviews || 0,
      publishedGoogle: overview?.data?.approvedReviews || 0,
      internalOnly: overview?.data?.rejectedReviews || 0,
      avgRating: overview?.data?.averageRating || 0,
    }
  }, [overview])

  /* =========================
     APPROVE
  ========================= */
  const handleApprovePush = async (review: any) => {
    try {
      await updateReviews({
        id: review.id,
        body: { reviewStatus: 'APPROVED' },
      }).unwrap()

      toast({
        variant: 'success',
        title: 'Review Approved',
        description: `${review.user?.name} approved successfully`,
      })
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.data?.message || 'Failed to approve',
        variant: 'destructive',
      })
    }
  }

  /* =========================
     REJECT
  ========================= */
  const handleRejectClick = (review: any) => {
    setReviewToAction(review)
    setIsConfirmOpen(true)
  }

  const handleConfirmReject = async () => {
    if (!reviewToAction) return

    setIsDeleting(true)

    try {
      await updateReviews({
        id: reviewToAction.id,
        body: { reviewStatus: 'REJECTED' },
      }).unwrap()

      toast({
        variant: 'success',
        title: 'Review Rejected',
        description: `${reviewToAction.user?.name} rejected`,
      })

      setIsConfirmOpen(false)
      setReviewToAction(null)
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.data?.message || 'Failed to reject',
        variant: 'destructive',
      })
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

  /* =========================
     LOADING
  ========================= */
  if (isLoading) {
    return (
      <div className="p-10 text-center text-muted-foreground">
        Loading reviews...
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 min-h-[60vh]"
    >
      {/* =========================
          BANNER
      ========================= */}
      <AutomationBanner />

      {/* =========================
          STATS
      ========================= */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Pending', value: stats.pendingApproval },
          { label: 'Approved', value: stats.publishedGoogle },
          { label: 'Rejected', value: stats.internalOnly },
          { label: 'Avg Rating', value: stats.avgRating.toFixed(1) },
        ].map((item, i) => (
          <div
            key={i}
            className="rounded-xl border bg-white p-5 shadow-sm"
          >
            <p className="text-xs text-muted-foreground uppercase">
              {item.label}
            </p>
            <p className="text-2xl font-bold mt-2">
              {item.value}
            </p>
          </div>
        ))}
      </div>

      {/* =========================
          TITLE
      ========================= */}
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-bold">
          {t('reviews.approvalQueueTitle')}
        </h1>
      </div>

      {/* =========================
          REVIEWS
      ========================= */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">
            No reviews found
          </div>
        ) : (
          reviews.map((review: any, index: number) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.03 * index }}
            >
              <ReviewCard
                review={{
                  id: review.id,
                  userId: review.userId,
                  customerName: review.user?.name || 'Unknown',
                  avatarUrl: review.user?.profilePicture,
                  rating: review.rating,
                  feedback: review.feedback,
                  reviewDate: new Date(
                    review.createdAt
                  ).toLocaleDateString(),
                  status: review.reviewStatus,
                  projectId: review.projectId ?? undefined,
                  projectName: review.projectName ?? undefined,
                }}
                onApprovePush={() =>
                  handleApprovePush(review)
                }
                onRejectInternal={() =>
                  handleRejectClick(review)
                }
              />
            </motion.div>
          ))
        )}
      </div>

      {/* =========================
          EXTRA SECTION
      ========================= */}
      <div className="grid gap-4 lg:grid-cols-2 pt-2">
        <div className="rounded-xl bg-slate-900 text-white p-5">
          <div className="flex items-center gap-2">
            <Search className="h-5 w-5 text-blue-300" />
            <h3 className="font-semibold">
              Google Business Reviews
            </h3>
          </div>
        </div>

        <div className="rounded-xl border bg-white p-5">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">
              Notification Alerts
            </h3>
          </div>

          <Button
            className="w-full mt-4"
            onClick={handleConfigureRecipients}
          >
            Configure
          </Button>
        </div>
      </div>

      {/* =========================
          CONFIRM
      ========================= */}
      <ConfirmDialog
        open={isConfirmOpen}
        onClose={() => {
          setIsConfirmOpen(false)
          setReviewToAction(null)
        }}
        onConfirm={handleConfirmReject}
        title="Reject Review"
        description={`Are you sure you want to reject ${reviewToAction?.user?.name}?`}
        confirmText="Reject"
        variant="danger"
        isLoading={isDeleting}
      />
    </motion.div>
  )
}