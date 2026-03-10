import type { Review, ReviewStatus } from '@/types'

export const REVIEW_STATUS_COLORS: Record<ReviewStatus, { bg: string; text: string }> = {
  Pending: { bg: 'bg-orange-100', text: 'text-orange-600' },
  Approved: { bg: 'bg-green-100', text: 'text-green-600' },
  Rejected: { bg: 'bg-red-100', text: 'text-red-600' },
}

export const FEEDBACK_MAX_LENGTH = 500

export const mockReviewsData: Review[] = [
  {
    id: 'rev-1',
    customerName: 'John Smith',
    projectName: 'Garden Design & Installation',
    rating: 3,
    feedback:
      'Awesome service! Everything was seamless. Highly recommended. Great work! As soon as I get the chance, I will definitely hire again.',
    status: 'Pending',
  },
  // {
  //   id: 'rev-2',
  //   customerName: 'Sarah Johnson',
  //   projectName: 'Oak Ridge Estates',
  //   rating: 5,
  //   feedback: 'Exceptional work. Will definitely hire again.',
  //   status: 'Approved',
  // },
  // {
  //   id: 'rev-3',
  //   customerName: 'Michael Brown',
  //   projectName: 'Green Villa',
  //   rating: 4,
  //   feedback: 'Good quality and on-time delivery. Minor follow-up needed.',
  //   status: 'Pending',
  // },
]
