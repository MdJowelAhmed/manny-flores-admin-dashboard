import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { FileText, Clock, Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SearchInput } from '@/components/common/SearchInput'
import { ViewDocumentDetailsModal } from './components/ViewDocumentDetailsModal'
import {
  mockDocumentStats,
  mockDocumentsData,
  type DocumentEntry,
} from './documentsApprovalsData'
import { cn } from '@/utils/cn'

const statCardKeys = [
  { titleKey: 'documentsApprovals.totalDocuments', value: 'totalDocuments', icon: FileText, iconBg: 'bg-blue-100', iconColor: 'text-blue-600' },
  { titleKey: 'documentsApprovals.pendingApproval', value: 'pendingApproval', icon: Clock, iconBg: 'bg-amber-100', iconColor: 'text-amber-600' },
  { titleKey: 'documentsApprovals.approved', value: 'approved', icon: Check, iconBg: 'bg-emerald-100', iconColor: 'text-emerald-600' },
  { titleKey: 'documentsApprovals.rejected', value: 'rejected', icon: X, iconBg: 'bg-red-100', iconColor: 'text-red-600' },
]

export default function DocumentsApprovals() {
  const { t } = useTranslation()
  const [searchQuery, setSearchQuery] = useState('')
  const [documents, setDocuments] = useState<DocumentEntry[]>(mockDocumentsData)
  const [selectedDoc, setSelectedDoc] = useState<DocumentEntry | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)

  const stats = mockDocumentStats

  const filteredDocuments = useMemo(() => {
    if (!searchQuery.trim()) return documents
    const q = searchQuery.toLowerCase()
    return documents.filter(
      (d) =>
        d.projectTitle.toLowerCase().includes(q) ||
        d.category.toLowerCase().includes(q) ||
        d.uploadedBy.toLowerCase().includes(q)
    )
  }, [documents, searchQuery])

  const handleViewDetails = (doc: DocumentEntry) => {
    setSelectedDoc(doc)
    setIsDetailModalOpen(true)
  }

  const handleApprove = (doc: DocumentEntry, e: React.MouseEvent) => {
    e.stopPropagation()
    setDocuments((prev) =>
      prev.map((d) => (d.id === doc.id ? { ...d, status: 'approved' as const } : d))
    )
  }

  const handleReject = (doc: DocumentEntry, e: React.MouseEvent) => {
    e.stopPropagation()
    setDocuments((prev) =>
      prev.map((d) => (d.id === doc.id ? { ...d, status: 'rejected' as const } : d))
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCardKeys.map((card, index) => {
          const Icon = card.icon
          const value = stats[card.value as keyof typeof stats]
          return (
            <motion.div
              key={card.titleKey}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="bg-white rounded-xl px-5 py-6 shadow-sm border border-gray-100"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{t(card.titleKey)}</p>
                  <h3 className="text-2xl font-bold text-foreground mt-1">{value}</h3>
                </div>
                <div className={cn('p-2.5 rounded-lg', card.iconBg)}>
                  <Icon className={cn('h-6 w-6', card.iconColor)} />
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Project Status Section */}
      <div className="border-0">
        <div className="flex flex-row items-center justify-between gap-4 pb-4">
          <h2 className="text-lg font-bold text-accent">{t('documentsApprovals.projectStatus')}</h2>
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder={t('documentsApprovals.searchDocuments')}
            className="w-[240px] bg-white"
            debounceMs={150}
          />
        </div>

        <div className="space-y-6">
          {filteredDocuments.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground text-sm">
              {t('documentsApprovals.noDocumentsFound')}
            </div>
          ) : (
            filteredDocuments.map((doc) => (
              <motion.div
                key={doc.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl shadow-sm bg-white border border-gray-100"
              >
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-accent text-base truncate">{doc.projectTitle}</h4>
                  <p className="text-sm text-muted-foreground mt-0.5">{doc.category}</p>
                  <div className="flex flex-wrap gap-x-6 gap-y-1 mt-5">
                    <div>
                      <span className="text-xs text-muted-foreground block mb-1">{t('documentsApprovals.project')}</span>
                      <span className="text-sm font-medium">{doc.project}</span>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground block mb-1">{t('documentsApprovals.uploadDateShort')}</span>
                      <span className="text-sm font-medium">{doc.uploadDate}</span>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground block mb-1">{t('documentsApprovals.uploadedBy')}</span>
                      <span className="text-sm font-medium">{doc.uploadedBy}</span>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground block mb-1">{t('common.timeline')}</span>
                      <span className="text-sm font-medium">{doc.timeline}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewDetails(doc)}
                    className="text-sm   bg-secondary-foreground text-accent h-9"
                  >
                    {t('documentsApprovals.viewDetails')}
                  </Button>
                  {doc.status === 'pending' && (
                    <>
                      <Button
                        size="sm"
                        variant="default"
                        className="bg-gray-700 hover:bg-gray-800 text-white h-9"
                        onClick={(e) => handleApprove(doc, e)}
                      >
                        {t('documentsApprovals.approve')}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="h-9  text-white"
                        onClick={(e) => handleReject(doc, e)}
                      >
                        {t('documentsApprovals.reject')}
                      </Button>
                    </>
                  )}
                </div>
              </motion.div>
            ))
          )}
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
    </motion.div>
  )
}
