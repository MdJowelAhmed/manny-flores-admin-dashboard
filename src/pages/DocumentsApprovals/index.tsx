import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { FileText, Send, UploadCloud, Download, Eye, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SearchInput } from '@/components/common/SearchInput'
import { UploadDocumentModal } from './components/UploadDocumentModal.tsx'
import { SendDocumentRequestModal } from './components/SendDocumentRequestModal.tsx'
import { ViewDocumentDetailsModal } from './components/ViewDocumentDetailsModal.tsx'
import { EditDocumentModal } from './components/EditDocumentModal.tsx'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { Pagination } from '@/components/common/Pagination'
import { useDeleteDocumentMutation, useGetDocumentsApprovalsQuery, useGetDocumentsOverviewQuery } from '@/redux/slices/super-admin/documentsApprovalApi.ts'
import { useDebounce } from '@/hooks/useDebounce.ts'
import Spinner from '@/components/common/Spinner.tsx'
import { imageUrl } from '@/redux/baseApi'
import { sonnerToast } from '@/utils/toast'

export default function DocumentsApprovals() {
  const { t } = useTranslation()
  const [searchQuery, setSearchQuery] = useState('')
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const [isRequestOpen, setIsRequestOpen] = useState(false)

  // Selection states for modals
  const [selectedDoc, setSelectedDoc] = useState<any | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)

  // Pagination
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const debouncedSearch = useDebounce(searchQuery, 500)

  // API CALLS
  const { data: overviewData, isLoading: overviewLoading } = useGetDocumentsOverviewQuery()
  const { data: documentsData, isLoading: documentsLoading, refetch: documentsRefetch } = useGetDocumentsApprovalsQuery({ limit, page, search: debouncedSearch })

  const [deleteDocument, { isLoading: isDeleting }] = useDeleteDocumentMutation()

  const documents = documentsData?.data || []
  const totalItems = documentsData?.pagination?.total || 0
  const totalPages = documentsData?.pagination?.totalPage || 1

  const handleCreated = () => {
    documentsRefetch()
  }

  const handleDelete = async () => {
    if (!selectedDoc) return

    const promise = deleteDocument(selectedDoc.id).unwrap()

    try {
      await sonnerToast.promise(promise, {
        loading: t('common.processing') || 'Deleting document...',
        success: t('common.deleted') || 'Document deleted successfully!',
        error: (err: any) => err?.data?.message || 'Failed to delete document.',
      })
      documentsRefetch()
      setIsDeleteOpen(false)
      setSelectedDoc(null)
    } catch (err) {
      console.error('Delete error:', err)
    }
  }

  if (documentsLoading || overviewLoading) {
    return <Spinner />
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 min-h-[60vh]"
    >
      <div className="grid gap-4 md:grid-cols-4">
        <div className="bg-white rounded-xl px-5 py-5 shadow-sm border border-gray-100">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">{t('documentsApprovals.totalDocuments')}</p>
              <h3 className="text-xl font-bold text-foreground mt-1">{overviewData?.data?.totalDocuments}</h3>
            </div>
            <div className="p-2.5 rounded-lg bg-indigo-50">
              <FileText className="h-5 w-5 text-indigo-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl px-5 py-5 shadow-sm border border-gray-100">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">{t('documentsApprovals.pendingApproval')}</p>
              <h3 className="text-xl font-bold text-foreground mt-1">{overviewData?.data?.pendingDocs}</h3>
            </div>
            <div className="p-2.5 rounded-lg bg-orange-50">
              <FileText className="h-5 w-5 text-orange-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl px-5 py-5 shadow-sm border border-gray-100">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">{t('documentsApprovals.approved')}</p>
              <h3 className="text-xl font-bold text-foreground mt-1">{overviewData?.data?.approvedDocs}</h3>
            </div>
            <div className="p-2.5 rounded-lg bg-emerald-50">
              <FileText className="h-5 w-5 text-emerald-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl px-5 py-5 shadow-sm border border-gray-100">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">{t('documentsApprovals.rejected')}</p>
              <h3 className="text-xl font-bold text-foreground mt-1">{overviewData?.data?.rejectedDocs}</h3>
            </div>
            <div className="p-2.5 rounded-lg bg-red-50">
              <FileText className="h-5 w-5 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="w-full rounded-xl border border-gray-200/90 bg-white shadow-sm overflow-hidden">
        <div className="px-5 py-4">
          <h2 className="text-base font-semibold text-slate-900">{t('documentsApprovals.pageTitle')}</h2>
        </div>

        <div className="px-5 pb-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder={t('documentsApprovals.searchDocuments')}
              className="w-full lg:w-[340px] bg-white rounded-lg border-gray-200"
              debounceMs={150}
            />
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                type="button"
                onClick={() => setIsRequestOpen(true)}
                className="rounded-lg bg-primary hover:bg-primary/90 text-white h-11 gap-2"
              >
                <Send className="h-4 w-4" />
                {t('documentsApprovals.sendDocumentRequest')}
              </Button>
              <Button
                type="button"
                onClick={() => setIsUploadOpen(true)}
                className="rounded-lg bg-primary hover:bg-primary/90 text-white h-11 gap-2"
              >
                <UploadCloud className="h-4 w-4" />
                {t('documentsApprovals.uploadDocument')}
              </Button>
            </div>
          </div>
        </div>

        <div className="w-full overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse">
            <thead>
              <tr className="bg-muted/50 text-left">
                <th className="px-6 py-4 text-sm font-semibold text-slate-700">
                  {t('documentsApprovals.projectName') || 'Project Name'}
                </th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-700">
                  {t('documentsApprovals.documentType') || 'Document Type'}
                </th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-700 text-right">
                  {t('common.actions')}
                </th>
              </tr>
            </thead>
            <tbody>
              {documents.length === 0 ? (
                <tr>
                  <td
                    colSpan={3}
                    className="px-6 py-12 text-center text-muted-foreground text-sm"
                  >
                    {t('documentsApprovals.noDocumentsFound')}
                  </td>
                </tr>
              ) : (
                documents.map((doc: any, index: number) => {
                  const fullDocUrl = doc.documentUrl?.startsWith('http')
                    ? doc.documentUrl
                    : `${imageUrl}${doc.documentUrl}`
                  return (
                    <motion.tr
                      key={doc.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.02 }}
                      className="border-t border-gray-100 bg-white hover:bg-muted/20"
                    >
                      <td className="px-6 py-4 align-middle font-medium text-foreground">
                        {doc.projectName || '—'}
                      </td>
                      <td className="px-6 py-4 align-middle text-sm font-semibold text-slate-600">
                        {doc.documentType || '—'}
                      </td>
                      <td className="px-6 py-4 align-middle text-right">
                        <div className="flex items-center justify-end gap-3">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedDoc(doc)
                              setIsDetailModalOpen(true)
                            }}
                            className="inline-flex items-center justify-center p-2 rounded-lg text-gray-400 hover:text-primary hover:bg-muted/40 transition-colors"
                            title={t('common.viewDetails') || 'View details'}
                          >
                            <Eye className="h-5 w-5" />
                          </button>
                          <a
                            href={fullDocUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center p-2 rounded-lg text-gray-400 hover:text-primary hover:bg-muted/40 transition-colors"
                            title="Download document"
                          >
                            <Download className="h-5 w-5" />
                          </a>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedDoc(doc)
                              setIsEditOpen(true)
                            }}
                            className="inline-flex items-center justify-center p-2 rounded-lg text-gray-400 hover:text-yellow-600 hover:bg-muted/40 transition-colors"
                            title={t('common.edit') || 'Edit'}
                          >
                            <Pencil className="h-5 w-5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedDoc(doc)
                              setIsDeleteOpen(true)
                            }}
                            className="inline-flex items-center justify-center p-2 rounded-lg text-gray-400 hover:text-destructive hover:bg-muted/40 transition-colors"
                            title={t('common.delete') || 'Delete'}
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {totalItems > 0 && (
          <div className="border-t border-gray-100 px-5 py-4">
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              totalItems={totalItems}
              itemsPerPage={limit}
              onPageChange={setPage}
              onItemsPerPageChange={setLimit}
              showItemsPerPage
            />
          </div>
        )}
      </div>

      <UploadDocumentModal open={isUploadOpen} onClose={() => setIsUploadOpen(false)} onCreated={handleCreated} />

      <SendDocumentRequestModal open={isRequestOpen} onClose={() => setIsRequestOpen(false)} />

      <ViewDocumentDetailsModal
        open={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false)
          setSelectedDoc(null)
        }}
        document={selectedDoc}
      />

      <EditDocumentModal
        open={isEditOpen}
        onClose={() => {
          setIsEditOpen(false)
          setSelectedDoc(null)
        }}
        documentsRefetch={documentsRefetch}
        document={selectedDoc}
      />

      <ConfirmDialog
        open={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false)
          setSelectedDoc(null)
        }}
        onConfirm={handleDelete}
        title={t('common.areYouSure') || 'Are you sure?'}
        description={t('common.deleteConfirmation') || 'This action cannot be undone.'}
        confirmText={t('common.delete') || 'Delete'}
        cancelText={t('common.cancel') || 'Cancel'}
        variant="danger"
        isLoading={isDeleting}
      />
    </motion.div>
  )
}
