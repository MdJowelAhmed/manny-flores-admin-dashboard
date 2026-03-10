import { useState } from 'react'
import { Star } from 'lucide-react'
import { FormInput, FormTextarea } from '@/components/common/Form'
import { Button } from '@/components/ui/button'
import type { Review } from '@/types'
import { FEEDBACK_MAX_LENGTH } from '../reviewData'
import { cn } from '@/utils/cn'

interface ReviewCardProps {
  review: Review
  onApproved: (data: Partial<Review>) => void
  onDelete: () => void
}

function StarRating({
  value,
  onChange,
}: {
  value: number
  onChange: (v: number) => void
}) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          onClick={() => onChange(i)}
          className="p-0.5 focus:outline-none"
        >
          <Star
            className={cn(
              'h-6 w-6 transition-colors',
              i <= value ? 'fill-amber-400 text-amber-400' : 'text-gray-300'
            )}
          />
        </button>
      ))}
      <span className="ml-2 text-sm text-muted-foreground">out of 5 star</span>
    </div>
  )
}

export function ReviewCard({ review, onApproved, onDelete }: ReviewCardProps) {
  const [customerName, setCustomerName] = useState(review.customerName)
  const [projectName, setProjectName] = useState(review.projectName)
  const [rating, setRating] = useState(review.rating)
  const [feedback, setFeedback] = useState(review.feedback)

  const handleApproved = () => {
    onApproved({
      customerName: customerName.trim(),
      projectName: projectName.trim(),
      rating,
      feedback: feedback.slice(0, FEEDBACK_MAX_LENGTH),
      status: 'Approved',
    })
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 lg:p-12 2xl:p-20">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
        <div>
          <h3 className="text-sm font-bold text-foreground mb-3">Customer Details</h3>
          <div className="space-y-4">
            <FormInput
              label="Customer Name"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Customer name"
              className="border-gray-200 bg-gray-50"
            />
            <FormInput
              label="Project Name"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="Project name"
              className="border-gray-200 bg-gray-50"
            />
          </div>
        </div>

        <div>
          <h3 className="text-sm font-bold text-foreground mb-3">
            Customer Feedback & Rating
          </h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block text-foreground">
                Rating
              </label>
              <StarRating value={rating} onChange={setRating} />
            </div>
            <div>
              <FormTextarea
                label="Feedback"
                value={feedback}
                onChange={(e) =>
                  setFeedback(e.target.value.slice(0, FEEDBACK_MAX_LENGTH))
                }
                placeholder="Enter feedback..."
                rows={6}
                maxLength={FEEDBACK_MAX_LENGTH}
                className="border-gray-200 bg-gray-50 resize-none"
              />
              <p className="text-xs text-muted-foreground mt-1">
                {feedback.length} characters / {FEEDBACK_MAX_LENGTH} max
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-6 mt-4">
        <Button
          type="button"
          variant="destructive"
          onClick={onDelete}
          className="px-5 py-2.5 rounded-lg"
        >
          Cancel
        </Button>
        <Button
          type="button"
          onClick={handleApproved}
          className="px-5 py-2.5 rounded-lg bg-primary hover:bg-primary/90 text-white"
        >
          Approved
        </Button>
      </div>
    </div>
  )
}
