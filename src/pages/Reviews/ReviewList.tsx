import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CardHeader, CardTitle } from '@/components/ui/card'
import { SearchInput } from '@/components/common/SearchInput'
import { Pagination } from '@/components/common/Pagination'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { ReviewCard } from './components/ReviewCard'
import { mockReviewsData } from './reviewData'
import type { Review } from '@/types'
import { toast } from '@/utils/toast'

export default function ReviewList() {
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
  const paginatedReviews = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return filteredReviews.slice(start, start + itemsPerPage)
  }, [filteredReviews, currentPage])

  const handleApproved = (review: Review, data: Partial<Review>) => {
    setReviews((prev) =>
      prev.map((r) => (r.id === review.id ? { ...r, ...data } : r))
    )
    toast({
      variant: 'success',
      title: 'Review Approved',
      description: `Review from ${data.customerName} has been approved.`,
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
        title: 'Review Deleted',
        description: `Review from ${reviewToDelete.customerName} has been removed.`,
      })
      setIsConfirmOpen(false)
      setReviewToDelete(null)
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to delete review.',
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
            No reviews found
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
                onApproved={(data) => handleApproved(review, data)}
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
        title="Delete Review"
        description={`Are you sure you want to delete the review from "${reviewToDelete?.customerName}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
        isLoading={isDeleting}
      />
    </motion.div>
  )
}
