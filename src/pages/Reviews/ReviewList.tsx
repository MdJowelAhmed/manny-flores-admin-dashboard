import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { ReviewCard } from './components/ReviewCard'
import { mockReviewsData } from './reviewData'
import type { Review } from '@/types'
import { toast } from '@/utils/toast'

export default function ReviewList() {
  const { t } = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()
  const searchQuery = searchParams.get('search') ?? ''
  const currentPage = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
  const itemsPerPage = 3

  const setSearch = (v: string) => {
    const next = new URLSearchParams(searchParams)
    v ? next.set('search', v) : next.delete('search')
    next.delete('page')
    setSearchParams(next, { replace: true })
  }
  const setPage = (p: number) => {
    const next = new URLSearchParams(searchParams)
    p > 1 ? next.set('page', String(p)) : next.delete('page')
    setSearchParams(next, { replace: true })
  }

  const [reviews, setReviews] = useState<Review[]>(mockReviewsData)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [reviewToDelete, setReviewToDelete] = useState<Review | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const filteredReviews = useMemo(() => {
    return reviews.filter((r) => {
      const matchesSearch =
        !searchQuery ||
        r.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.feedback.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesSearch
    })
  }, [reviews, searchQuery])

  const totalPages = Math.max(1, Math.ceil(filteredReviews.length / itemsPerPage))
  void totalPages // reserved for pagination UI
  void setSearch
  void setPage
  const paginatedReviews = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return filteredReviews.slice(start, start + itemsPerPage)
  }, [filteredReviews, currentPage])

  const handleApproved = (review: Review) => {
    setReviews((prev) =>
      prev.map((r) => (r.id === review.id ? { ...r, status: 'Approved' as const } : r))
    )
    toast({
      variant: 'success',
      title: t('reviews.reviewApproved'),
      description: t('reviews.reviewApprovedDesc', { name: review.customerName }),
    })
  }

  const handleDelete = (review: Review) => {
    setReviewToDelete(review)
    setIsConfirmOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!reviewToDelete) return
    setIsDeleting(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 300))
      setReviews((prev) => prev.filter((r) => r.id !== reviewToDelete.id))
      toast({
        variant: 'success',
        title: t('reviews.reviewRejected'),
        description: t('reviews.reviewRejectedDesc', { name: reviewToDelete.customerName }),
      })
      setIsConfirmOpen(false)
      setReviewToDelete(null)
    } catch {
      toast({
        title: t('common.error'),
        description: t('reviews.failedToDelete'),
        variant: 'destructive',
      })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* <CardHeader className="flex flex-row items-center justify-between pb-6">
        <CardTitle className="text-xl font-bold text-accent">Reviews</CardTitle>
        <SearchInput
          value={searchQuery}
          onChange={setSearch}
          placeholder="Search reviews..."
          className="w-[280px] bg-white"
          debounceMs={150}
        />
      </CardHeader> */}

      <div className="space-y-6">
        {paginatedReviews.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 p-12 text-center text-muted-foreground">
            {t('reviews.noReviewsFound')}
          </div>
        ) : (
          paginatedReviews.map((review, index) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * index }}
            >
              <ReviewCard
                review={review}
                onApproved={() => handleApproved(review)}
                onDelete={() => handleDelete(review)}
              />
            </motion.div>
          ))
        )}
      </div>

      {/* {filteredReviews.length > 0 && (
        <div className="border-t border-gray-100 px-2 py-4">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredReviews.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setPage}
          />
        </div>
      )} */}

      <ConfirmDialog
        open={isConfirmOpen}
        onClose={() => {
          setIsConfirmOpen(false)
          setReviewToDelete(null)
        }}
        onConfirm={handleConfirmDelete}
        title={t('reviews.rejectReview')}
        description={t('reviews.rejectReviewConfirm', { name: reviewToDelete?.customerName ?? '' })}
        confirmText={t('reviews.reject')}
        variant="danger"
        isLoading={isDeleting}
      />
    </motion.div>
  )
}
