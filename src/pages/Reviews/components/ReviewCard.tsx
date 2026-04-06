import { Star, Calendar, ThumbsUp, Ban, MessageSquare } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import type { Review } from '@/types'
import { cn } from '@/utils/cn'

interface ReviewCardProps {
  review: Review
  onApprovePush: () => void
  onRejectInternal: () => void
  onFollowUp: () => void
}

function StarRatingDisplay({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={cn(
            'h-4 w-4 sm:h-5 sm:w-5',
            i <= value ? 'fill-amber-400 text-amber-400' : 'text-gray-200'
          )}
        />
      ))}
    </div>
  )
}

export function ReviewCard({ review, onApprovePush, onRejectInternal, onFollowUp }: ReviewCardProps) {
  const { t } = useTranslation()
  const initials = review.customerName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <div className="bg-white rounded-xl border border-gray-200/90 shadow-sm p-4 sm:p-5">
      <div className="flex flex-col sm:flex-row gap-4 sm:gap-5">
        <Avatar className="h-14 w-14 sm:h-16 sm:w-16 shrink-0 rounded-lg border border-gray-100">
          <AvatarImage src={review.avatarUrl} alt="" className="object-cover" />
          <AvatarFallback className="rounded-lg text-sm font-semibold bg-muted">{initials}</AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-bold text-foreground">{review.customerName}</h3>
            {review.projectId && (
              <span className="text-xs font-medium text-muted-foreground px-2 py-0.5 rounded-md bg-muted">
                {review.projectId}
              </span>
            )}
          </div>
          <StarRatingDisplay value={review.rating} />
          <p className="text-sm text-foreground leading-relaxed">{review.feedback}</p>
          {review.reviewDate && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground pt-1">
              <Calendar className="h-3.5 w-3.5 shrink-0" />
              <span>{review.reviewDate}</span>
            </div>
          )}
        </div>

        <div className="flex sm:flex-col gap-2 shrink-0 sm:items-stretch sm:min-w-[160px]">
          {review.status === 'Approved' ? (
            <span className="sm:text-center px-3 py-2.5 rounded-lg text-sm font-semibold bg-primary/15 text-primary">
              {t('reviews.approvedBadge')}
            </span>
          ) : (
            <>
              <Button
                type="button"
                size="sm"
                className="rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground gap-1.5 h-9 sm:h-10"
                onClick={onApprovePush}
              >
                <ThumbsUp className="h-3.5 w-3.5" />
                {t('reviews.approveAndPush')}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="rounded-lg border-red-200 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 gap-1.5 h-9 sm:h-10"
                onClick={onRejectInternal}
              >
                <Ban className="h-3.5 w-3.5" />
                {t('reviews.rejectInternal')}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="rounded-lg border-gray-200 text-muted-foreground hover:bg-muted/50 gap-1.5 h-9 sm:h-10"
                onClick={onFollowUp}
              >
                <MessageSquare className="h-3.5 w-3.5" />
                {t('reviews.followUp')}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
