import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { FileText, Plus, Send, UploadCloud } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SearchInput } from '@/components/common/SearchInput'
import { ViewDocumentDetailsModal } from './components/ViewDocumentDetailsModal'
import { NewDocumentModal } from './components/NewDocumentModal.tsx'
import { UploadDocumentModal } from './components/UploadDocumentModal.tsx'
import { SendDocumentRequestModal } from './components/SendDocumentRequestModal.tsx'
import {
  mockDocumentsData,
  type DocumentEntry,
} from './documentsApprovalsData'
import { cn } from '@/utils/cn'

export default function DocumentsApprovals() {
  const { t } = useTranslation()
  const [searchQuery, setSearchQuery] = useState('')
  const [documents, setDocuments] = useState<DocumentEntry[]>(mockDocumentsData)
  const [selectedDoc, setSelectedDoc] = useState<DocumentEntry | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [isNewDocOpen, setIsNewDocOpen] = useState(false)
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const [isRequestOpen, setIsRequestOpen] = useState(false)

  const filteredDocuments = useMemo(() => {
    return documents.filter((d) => {
      if (!searchQuery.trim()) return true
      const q = searchQuery.toLowerCase()
      return (
        d.projectTitle.toLowerCase().includes(q) ||
        d.documentTypeLabel.toLowerCase().includes(q) ||
        d.uploadedBy.toLowerCase().includes(q) ||
        d.projectName.toLowerCase().includes(q)
      )
    })
  }, [documents, searchQuery])

  const stats = useMemo(() => {
    const total = documents.length
    const approved = documents.filter((d) => d.status === 'approved').length
    const rejected = documents.filter((d) => d.status === 'rejected').length
    const pending = documents.filter((d) => d.status === 'review' || d.status === 'signing').length
    return { total, pending, approved, rejected }
  }, [documents])

  const handleViewDetails = (doc: DocumentEntry) => {
    setSelectedDoc(doc)
    setIsDetailModalOpen(true)
  }

  const handleCreated = (doc: DocumentEntry) => {
    setDocuments((prev) => [doc, ...prev])
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
              <h3 className="text-xl font-bold text-foreground mt-1">{stats.total}</h3>
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
              <h3 className="text-xl font-bold text-foreground mt-1">{stats.pending}</h3>
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
              <h3 className="text-xl font-bold text-foreground mt-1">{stats.approved}</h3>
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
              <h3 className="text-xl font-bold text-foreground mt-1">{stats.rejected}</h3>
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
                onClick={() => setIsNewDocOpen(true)}
                className="rounded-lg bg-primary hover:bg-primary/90 text-white h-11 gap-2"
              >
                <Plus className="h-4 w-4" />
                {t('documentsApprovals.newDocument')}
              </Button>
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
                {t('documentsApprovals.titleCol')}
              </th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-700">
                {t('documentsApprovals.version')}
              </th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-700 text-right">
                {t('common.actions')}
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredDocuments.length === 0 ? (
              <tr>
                <td
                  colSpan={3}
                  className="px-6 py-12 text-center text-muted-foreground text-sm"
                >
                  {t('documentsApprovals.noDocumentsFound')}
                </td>
              </tr>
            ) : (
              filteredDocuments.map((doc, index) => (
                <motion.tr
                  key={doc.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.02 }}
                  className="border-t border-gray-100 bg-white hover:bg-muted/20"
                >
                  <td className="px-6 py-4 align-top">
                    <div className="font-semibold text-foreground leading-snug max-w-[420px]">
                      {doc.projectTitle}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {doc.documentTypeLabel} • {doc.uploadDate}
                    </p>
                  </td>
                  <td className="px-6 py-4 align-top text-sm font-medium text-foreground">
                    {doc.version}
                  </td>
                  <td className="px-6 py-4 align-top text-right">
                    <button
                      type="button"
                      onClick={() => handleViewDetails(doc)}
                      className={cn('text-sm font-medium text-muted-foreground hover:text-primary')}
                    >
                      {t('documentsApprovals.viewDetails')}
                    </button>
                  </td>
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
        </div>
      </div>

      <ViewDocumentDetailsModal
        open={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false)
          setSelectedDoc(null)
        }}
        document={selectedDoc}
      />

      <NewDocumentModal open={isNewDocOpen} onClose={() => setIsNewDocOpen(false)} onCreated={handleCreated} />

      <UploadDocumentModal open={isUploadOpen} onClose={() => setIsUploadOpen(false)} onCreated={handleCreated} />

      <SendDocumentRequestModal open={isRequestOpen} onClose={() => setIsRequestOpen(false)} />
    </motion.div>
  )
}
