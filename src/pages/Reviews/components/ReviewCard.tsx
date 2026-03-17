import { Star } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import type { Review } from '@/types'
import { cn } from '@/utils/cn'
import { REVIEW_STATUS_COLORS } from '../reviewData'

interface ReviewCardProps {
  review: Review
  onApproved: () => void
  onDelete: () => void
}

function StarRatingDisplay({ value }: { value: number }) {
  const { t } = useTranslation()
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={cn(
            'h-6 w-6',
            i <= value ? 'fill-amber-400 text-amber-400' : 'text-gray-300'
          )}
        />
      ))}
      <span className="ml-2 text-sm text-muted-foreground">
        {t('reviews.starsOutOf5', { value })}
      </span>
    </div>
  )
}

export function ReviewCard({ review, onApproved, onDelete }: ReviewCardProps) {
  const { t } = useTranslation()
  const statusColors = REVIEW_STATUS_COLORS[review.status]

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 lg:p-12 2xl:p-20">
      <div className="flex justify-between items-start gap-4 mb-6">
        <h3 className="text-lg font-semibold text-foreground">{t('reviews.customerReview')}</h3>
        <span
          className={cn(
            'px-3 py-1 rounded-full text-sm font-medium',
            statusColors.bg,
            statusColors.text
          )}
        >
          {review.status}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h4 className="text-sm font-bold text-foreground mb-3">{t('reviews.customerDetails')}</h4>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">{t('reviews.customerName')}</p>
              <p className="text-sm font-medium text-foreground">{review.customerName}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">{t('reviews.projectName')}</p>
              <p className="text-sm font-medium text-foreground">{review.projectName}</p>
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-bold text-foreground mb-3">{t('reviews.ratingFeedback')}</h4>
          <div className="space-y-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1.5">{t('reviews.rating')}</p>
              <StarRatingDisplay value={review.rating} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1.5">{t('reviews.feedback')}</p>
              <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap bg-gray-50 rounded-lg p-4 border border-gray-100">
                {review.feedback}
              </p>
            </div>
          </div>
        </div>
      </div>

      {review.status === 'Pending' && (
        <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-gray-100">
          <Button
            type="button"
            variant="destructive"
            onClick={onDelete}
            className="px-5 py-2.5 rounded-lg text-white"
          >
            {t('reviews.reject')}
          </Button>
          <Button
            type="button"
            onClick={onApproved}
            className="px-5 py-2.5 rounded-lg bg-primary hover:bg-primary/90 text-white"
          >
            {t('reviews.approve')}
          </Button>
        </div>
      )}
    </div>
  )
}
