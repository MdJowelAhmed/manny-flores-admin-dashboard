import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { Plus, SlidersHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { SearchInput } from '@/components/common/SearchInput'
import { ViewDocumentDetailsModal } from './components/ViewDocumentDetailsModal'
import { NewUploadModal } from './components/NewUploadModal'
import {
  mockDocumentsData,
  documentCategoryFilterOptions,
  type DocumentEntry,
  type DocumentTrailStatus,
} from './documentsApprovalsData'
import { formatCurrency } from '@/utils/formatters'
import { cn } from '@/utils/cn'

function statusClass(status: DocumentTrailStatus): string {
  switch (status) {
    case 'review':
      return 'text-orange-600 font-medium'
    case 'signing':
      return 'text-purple-600 font-medium'
    case 'approved':
      return 'text-primary font-medium'
    case 'rejected':
      return 'text-destructive font-medium'
    default:
      return 'text-foreground'
  }
}

export default function DocumentsApprovals() {
  const { t } = useTranslation()
  const [searchQuery, setSearchQuery] = useState('')
  const [documents, setDocuments] = useState<DocumentEntry[]>(mockDocumentsData)
  const [selectedDoc, setSelectedDoc] = useState<DocumentEntry | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const [categoryFilter, setCategoryFilter] = useState<string>('all')

  const filteredDocuments = useMemo(() => {
    return documents.filter((d) => {
      const matchesCategory =
        categoryFilter === 'all' || d.documentCategory === categoryFilter
      if (!matchesCategory) return false
      if (!searchQuery.trim()) return true
      const q = searchQuery.toLowerCase()
      return (
        d.projectTitle.toLowerCase().includes(q) ||
        d.documentTypeLabel.toLowerCase().includes(q) ||
        d.uploadedBy.toLowerCase().includes(q) ||
        d.projectName.toLowerCase().includes(q)
      )
    })
  }, [documents, searchQuery, categoryFilter])

  const handleViewDetails = (doc: DocumentEntry) => {
    setSelectedDoc(doc)
    setIsDetailModalOpen(true)
  }

  const handleApprove = (doc: DocumentEntry, e: React.MouseEvent) => {
    e.stopPropagation()
    setDocuments((prev) =>
      prev.map((d) => (d.id === doc.id ? { ...d, status: 'approved' as const } : d))
    )
    setSelectedDoc((s) => (s?.id === doc.id ? { ...s, status: 'approved' } : s))
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
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          {t('documentsApprovals.pageTitle')}
        </h1>
        <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder={t('documentsApprovals.searchDocuments')}
            className="w-full sm:w-[280px] bg-white rounded-lg border-gray-200"
            debounceMs={150}
          />
          <div className="w-full sm:w-[200px]">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full bg-primary text-white hover:bg-primary/90 border-0 h-11 [&_svg]:text-white">
                <SlidersHorizontal className="h-4 w-4 mr-2 shrink-0" />
                <SelectValue placeholder={t('documentsApprovals.filterTitle')} />
              </SelectTrigger>
              <SelectContent>
                {documentCategoryFilterOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {t(option.labelKey)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            type="button"
            onClick={() => setIsUploadOpen(true)}
            className="rounded-lg bg-primary hover:bg-primary/90 text-white h-11 gap-2"
          >
            <Plus className="h-4 w-4" />
            {t('documentsApprovals.newUpload')}
          </Button>
        </div>
      </div>

      <div className="w-full overflow-x-auto rounded-xl border border-gray-200/90 bg-white shadow-sm">
        <table className="w-full min-w-[900px] border-collapse">
          <thead>
            <tr className="bg-muted/60 text-left">
              <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wide text-foreground/90">
                {t('documentsApprovals.colDocumentProject')}
              </th>
              <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wide text-foreground/90">
                {t('documentsApprovals.version')}
              </th>
              <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wide text-foreground/90">
                {t('documentsApprovals.uploadedBy')}
              </th>
              <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wide text-foreground/90">
                {t('documentsApprovals.budget')}
              </th>
              <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wide text-foreground/90">
                {t('common.timeline')}
              </th>
              <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wide text-foreground/90">
                {t('documentsApprovals.statusLabel')}
              </th>
              <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wide text-foreground/90 text-right">
                {t('common.actions')}
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredDocuments.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-5 py-12 text-center text-muted-foreground text-sm"
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
                  <td className="px-5 py-4 align-top">
                    <div className="font-semibold text-foreground leading-snug max-w-[240px]">
                      {doc.projectTitle}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {doc.documentTypeLabel} • {doc.uploadDate}
                    </p>
                  </td>
                  <td className="px-5 py-4 align-top text-sm font-medium text-foreground">
                    {doc.version}
                  </td>
                  <td className="px-5 py-4 align-top text-sm text-foreground">{doc.uploadedBy}</td>
                  <td className="px-5 py-4 align-top text-sm font-medium text-foreground">
                    {formatCurrency(doc.budgetAmount)}
                  </td>
                  <td className="px-5 py-4 align-top text-sm text-foreground">{doc.timeline}</td>
                  <td className="px-5 py-4 align-top">
                    <span className={cn('text-sm', statusClass(doc.status))}>
                      {t(`documentsApprovals.status.${doc.status}`)}
                    </span>
                  </td>
                  <td className="px-5 py-4 align-top text-right">
                    <div className="flex flex-wrap justify-end items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleViewDetails(doc)}
                        className="text-sm font-medium text-primary hover:underline"
                      >
                        {t('documentsApprovals.viewDetails')}
                      </button>
                      {doc.status === 'review' && (
                        <Button
                          type="button"
                          size="sm"
                          className="h-8 rounded-lg bg-zinc-800 hover:bg-zinc-900 text-white"
                          onClick={(e) => handleApprove(doc, e)}
                        >
                          {t('documentsApprovals.approve')}
                        </Button>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <ViewDocumentDetailsModal
        open={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false)
          setSelectedDoc(null)
        }}
        document={selectedDoc}
      />

      <NewUploadModal
        open={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onCreated={handleCreated}
      />
    </motion.div>
  )
}
