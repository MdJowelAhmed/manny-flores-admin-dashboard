import { Star, Calendar, ThumbsUp, Ban, MessageSquare } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/utils/cn'
import { ReviewUI } from '@/types'
import { useNavigate } from 'react-router-dom'
import { useCreateInitialChatMutation } from '@/redux/slices/super-admin/chatApi'
import { toast } from '@/utils/toast'

interface ReviewCardProps {
  review: ReviewUI
  onApprovePush: () => void
  onRejectInternal: () => void
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

export function ReviewCard({
  review,
  onApprovePush,
  onRejectInternal,
}: ReviewCardProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [createInitialChat, { isLoading: isCreatingChat }] = useCreateInitialChatMutation()

  const initials = review.customerName
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  const handleFollowUp = async () => {
    if (!review.userId) {
      toast({
        title: t('common.error'),
        description: t('reviews.followUpUserMissing'),
        variant: 'destructive',
      })
      return
    }

    try {
      const response = await createInitialChat(review.userId).unwrap()

      if (response?.data?.id) {
        navigate(`/communication?chatId=${response.data.id}`, {
          state: { pendingChat: response.data },
        })
      } else {
        navigate('/communication')
      }
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
          : t('reviews.followUpFailed')
      toast({
        title: t('common.error'),
        description: message,
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200/90 shadow-sm p-4 sm:p-5">
      <div className="flex flex-col sm:flex-row gap-4 sm:gap-5">

        <Avatar className="h-14 w-14 sm:h-16 sm:w-16 shrink-0 rounded-lg border border-gray-100">
          <AvatarImage src={review.avatarUrl || ''} />
          <AvatarFallback className="rounded-lg text-sm font-semibold bg-muted">
            {initials}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0 space-y-2">

          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-bold text-foreground">
              {review.customerName}
            </h3>
            {review.projectName && (
              <span className="text-xs font-medium text-muted-foreground px-2 py-0.5 rounded-md bg-secondary-foreground">
                {review.projectName}
              </span>
            )}
          </div>

          <StarRatingDisplay value={review.rating} />

          <p className="text-sm text-foreground leading-relaxed">
            {review.feedback}
          </p>

          {review.reviewDate && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground pt-1">
              <Calendar className="h-3.5 w-3.5" />
              <span>{review.reviewDate}</span>
            </div>
          )}
        </div>

        <div className="flex sm:flex-col gap-2 shrink-0 sm:min-w-[160px]">

          {review.status === 'APPROVED' ? (
            <span className="sm:text-center px-3 py-2.5 rounded-lg text-sm font-semibold bg-primary/15 text-primary">
              {t('reviews.approvedBadge')}
            </span>
          ) : review.status === 'REJECTED' ? (
            <span className="sm:text-center px-3 py-2.5 rounded-lg text-sm font-semibold  text-red-600">
              {t('reviews.rejectedBadge')}
            </span>
          ) : (
            <>
              <Button
                size="sm"
                className="bg-primary text-white"
                onClick={onApprovePush}
              >
                <ThumbsUp className="h-4 w-4 mr-1" />
                {t('reviews.approveAndPush')}
              </Button>

              <Button
                size="sm"
                variant="outline"
                className="text-red-600"
                onClick={onRejectInternal}
              >
                <Ban className="h-4 w-4 mr-1" />
                {t('reviews.rejectInternal')}
              </Button>

              <Button
                size="sm"
                variant="outline"
                onClick={handleFollowUp}
                disabled={isCreatingChat}
                isLoading={isCreatingChat}
              >
                <MessageSquare className="h-4 w-4 mr-1" />
                {t('reviews.followUp')}
              </Button>
            </>
          )}
        </div>

      </div>
    </div>
  )
}