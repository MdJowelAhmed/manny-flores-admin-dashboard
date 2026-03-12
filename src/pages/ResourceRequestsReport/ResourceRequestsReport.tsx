import { useState, useMemo, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Pagination } from '@/components/common/Pagination'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { RequestTable } from './components/RequestTable'
import { ReportTable } from './components/ReportTable'
import { ViewRequestDetailsModal } from './components/ViewRequestDetailsModal'
import { ViewReportDetailsModal } from './components/ViewReportDetailsModal'
import {
  mockResourceRequests,
  mockResourceReports,
  type ResourceRequest,
  type ResourceReport,
} from './resourceRequestsData'
import { toast } from '@/utils/toast'

export default function ResourceRequestsReport() {
  const [searchParams, setSearchParams] = useSearchParams()
  const tabParam = searchParams.get('tab') || 'request'
  const currentPage = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
  const itemsPerPage = Math.max(1, parseInt(searchParams.get('limit') || '10', 10)) || 10

  const [requests, setRequests] = useState<ResourceRequest[]>(mockResourceRequests)
  const [reports, setReports] = useState<ResourceReport[]>(mockResourceReports)

  const [viewRequest, setViewRequest] = useState<ResourceRequest | null>(null)
  const [viewReport, setViewReport] = useState<ResourceReport | null>(null)
  const [requestToDelete, setRequestToDelete] = useState<ResourceRequest | null>(null)
  const [reportToDelete, setReportToDelete] = useState<ResourceReport | null>(null)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const activeData = tabParam === 'report' ? reports : requests
  const totalPages = Math.max(1, Math.ceil(activeData.length / itemsPerPage))

  const setPage = (p: number) => {
    const next = new URLSearchParams(searchParams)
    p > 1 ? next.set('page', String(p)) : next.delete('page')
    setSearchParams(next, { replace: true })
  }
  const setLimit = (l: number) => {
    const next = new URLSearchParams(searchParams)
    l !== 10 ? next.set('limit', String(l)) : next.delete('limit')
    next.delete('page')
    setSearchParams(next, { replace: true })
  }

  const setTab = (t: string) => {
    const next = new URLSearchParams(searchParams)
    next.set('tab', t)
    next.delete('page')
    setSearchParams(next, { replace: true })
  }

  useEffect(() => {
    if (currentPage > totalPages && totalPages >= 1) setPage(1)
  }, [totalPages, currentPage])

  const paginatedRequests = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return requests.slice(start, start + itemsPerPage)
  }, [requests, currentPage, itemsPerPage])

  const paginatedReports = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return reports.slice(start, start + itemsPerPage)
  }, [reports, currentPage, itemsPerPage])

  const handleDeleteRequest = (r: ResourceRequest) => {
    setRequestToDelete(r)
    setReportToDelete(null)
    setIsConfirmOpen(true)
  }

  const handleDeleteReport = (r: ResourceReport) => {
    setReportToDelete(r)
    setRequestToDelete(null)
    setIsConfirmOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (requestToDelete) {
      setIsDeleting(true)
      try {
        await new Promise((res) => setTimeout(res, 300))
        setRequests((prev) => prev.filter((rec) => rec.id !== requestToDelete.id))
        toast({
          variant: 'success',
          title: 'Request Deleted',
          description: 'Resource request has been removed.',
        })
        setIsConfirmOpen(false)
        setRequestToDelete(null)
      } catch {
        toast({ title: 'Error', description: 'Failed to delete.', variant: 'destructive' })
      } finally {
        setIsDeleting(false)
      }
    }
    if (reportToDelete) {
      setIsDeleting(true)
      try {
        await new Promise((res) => setTimeout(res, 300))
        setReports((prev) => prev.filter((rec) => rec.id !== reportToDelete.id))
        toast({
          variant: 'success',
          title: 'Report Deleted',
          description: 'Resource report has been removed.',
        })
        setIsConfirmOpen(false)
        setReportToDelete(null)
      } catch {
        toast({ title: 'Error', description: 'Failed to delete.', variant: 'destructive' })
      } finally {
        setIsDeleting(false)
      }
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="rounded-xl  overflow-hidden shadow-sm">
        <Tabs
          value={tabParam}
          onValueChange={setTab}
          className="w-full"
        >
          <div className="  pb-4">
            <TabsList className="h-[44px] bg-gray-100 p-1">
              <TabsTrigger value="request" className="px-5 py-3 text-sm">
                Request
              </TabsTrigger>
              <TabsTrigger value="report" className="px-5 py-3 text-sm">
                Report
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="request" className="mt-0 bg-white rounded-xl">
            <RequestTable
              records={paginatedRequests}
              onView={setViewRequest}
              onEdit={() => {}}
              onDelete={handleDeleteRequest}
            />
            {requests.length > 0 && (
              <div className="border-t border-gray-100 px-4 py-3">
                <Pagination
                  currentPage={currentPage}
                  totalPages={Math.max(1, Math.ceil(requests.length / itemsPerPage))}
                  totalItems={requests.length}
                  itemsPerPage={itemsPerPage}
                  onPageChange={setPage}
                  onItemsPerPageChange={setLimit}
                  showItemsPerPage
                />
              </div>
            )}
          </TabsContent>

          <TabsContent value="report" className="mt-0">
            <ReportTable
              records={paginatedReports}
              onView={setViewReport}
              onEdit={() => {}}
              onDelete={handleDeleteReport}
            />
            {reports.length > 0 && (
              <div className="border-t border-gray-100 px-4 py-3">
                <Pagination
                  currentPage={currentPage}
                  totalPages={Math.max(1, Math.ceil(reports.length / itemsPerPage))}
                  totalItems={reports.length}
                  itemsPerPage={itemsPerPage}
                  onPageChange={setPage}
                  onItemsPerPageChange={setLimit}
                  showItemsPerPage
                />
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <ViewRequestDetailsModal
        open={!!viewRequest}
        onClose={() => setViewRequest(null)}
        record={viewRequest}
        onApproved={() =>
          toast({ variant: 'success', title: 'Approved', description: 'Request approved.' })
        }
      />

      <ViewReportDetailsModal
        open={!!viewReport}
        onClose={() => setViewReport(null)}
        record={viewReport}
      />

      <ConfirmDialog
        open={isConfirmOpen}
        onClose={() => {
          setIsConfirmOpen(false)
          setRequestToDelete(null)
          setReportToDelete(null)
        }}
        onConfirm={handleConfirmDelete}
        title={
          requestToDelete ? 'Delete Resource Request' : 'Delete Resource Report'
        }
        description={
          requestToDelete
            ? 'Are you sure you want to delete this resource request? This action cannot be undone.'
            : 'Are you sure you want to delete this report? This action cannot be undone.'
        }
        confirmText="Delete"
        variant="danger"
        isLoading={isDeleting}
      />
    </motion.div>
  )
}
