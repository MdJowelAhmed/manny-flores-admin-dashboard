import type { Review, ReviewStatus } from '@/types'

export const REVIEW_STATUS_COLORS: Record<ReviewStatus, { bg: string; text: string }> = {
  Pending: { bg: 'bg-orange-100', text: 'text-orange-700' },
  Approved: { bg: 'bg-primary/15', text: 'text-primary' },
  Rejected: { bg: 'bg-red-100', text: 'text-red-600' },
}

export const FEEDBACK_MAX_LENGTH = 500

/** Published / internal counts for dashboard (demo; adjust as needed) */
export const reviewPlatformStats = {
  publishedGoogle: 156,
  internalOnly: 12,
}

export const mockReviewsData: Review[] = [
  {
    id: 'rev-1',
    caseId: 'REV-001',
    customerName: 'Sarah Jenkins',
    projectName: 'Backyard Renovation',
    projectId: 'PRJ-371',
    rating: 5,
    feedback:
      'The team did an amazing job with the patio and the new irrigation system. Highly recommend GreenScape!',
    status: 'Pending',
    reviewDate: 'March 25, 2026',
    avatarUrl: 'https://i.pravatar.cc/150?img=12',
  },
  {
    id: 'rev-2',
    caseId: 'REV-002',
    customerName: 'Robert Fox',
    projectName: 'Lawn Care Package',
    projectId: 'PRJ-371',
    rating: 5,
    feedback:
      'Professional crew, on time every day. The landscaping exceeded our expectations. Thank you!',
    status: 'Pending',
    reviewDate: 'March 24, 2026',
    avatarUrl: 'https://i.pravatar.cc/150?img=33',
  },
  {
    id: 'rev-3',
    caseId: 'REV-003',
    customerName: 'Emily Chen',
    projectName: 'Office Park Landscaping',
    projectId: 'PRJ-410',
    rating: 4,
    feedback: 'Great communication and solid work. Would use again for phase two.',
    status: 'Approved',
    reviewDate: 'March 20, 2026',
    avatarUrl: 'https://i.pravatar.cc/150?img=47',
  },
]
