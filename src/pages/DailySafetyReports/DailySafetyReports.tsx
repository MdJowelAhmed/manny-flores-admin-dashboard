import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Pagination } from '@/components/common/Pagination'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { SafetyChecklistCard } from './components/SafetyChecklistCard'
import { IncidentReportCard } from './components/IncidentReportCard'
import { ViewSafetyReportModal } from './components/ViewSafetyReportModal'
import { ViewIncidentDetailsModal } from './components/ViewIncidentDetailsModal'
import { ViewTemplateModal } from './components/ViewTemplateModal'
import { AddTemplateModal } from './components/AddTemplateModal'
import {
  mockSafetyChecklistSubmissions,
  mockIncidentReportSubmissions,
  mockSafetyTemplateItems,
  type SafetyChecklistSubmission,
  type IncidentReportSubmission,
  type SafetyTemplateItem,
} from './dailySafetyReportsData'
import { cn } from '@/utils/cn'

type ReportTab = 'checklist' | 'incident'

const DEFAULT_ITEMS_PER_PAGE = 10

export default function DailySafetyReports() {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState<ReportTab>('checklist')
  const [checklistSubmissions, setChecklistSubmissions] = useState(mockSafetyChecklistSubmissions)
  const [incidentSubmissions] = useState(mockIncidentReportSubmissions)
  const [templateItems, setTemplateItems] = useState<SafetyTemplateItem[]>(mockSafetyTemplateItems)

  const [selectedChecklist, setSelectedChecklist] = useState<SafetyChecklistSubmission | null>(null)
  const [selectedIncident, setSelectedIncident] = useState<IncidentReportSubmission | null>(null)
  const [isViewSafetyModalOpen, setIsViewSafetyModalOpen] = useState(false)
  const [isViewIncidentModalOpen, setIsViewIncidentModalOpen] = useState(false)
  const [isViewTemplateOpen, setIsViewTemplateOpen] = useState(false)
  const [isAddTemplateOpen, setIsAddTemplateOpen] = useState(false)
  const [editingTemplateItem, setEditingTemplateItem] = useState<SafetyTemplateItem | null>(null)
  const [itemToDelete, setItemToDelete] = useState<SafetyTemplateItem | null>(null)

  const [checklistPage, setChecklistPage] = useState(1)
  const [incidentPage, setIncidentPage] = useState(1)
  const [checklistItemsPerPage, setChecklistItemsPerPage] = useState(DEFAULT_ITEMS_PER_PAGE)
  const [incidentItemsPerPage, setIncidentItemsPerPage] = useState(DEFAULT_ITEMS_PER_PAGE)



  const checklistTotalPages = Math.ceil(checklistSubmissions.length / checklistItemsPerPage) || 1
  const incidentTotalPages = Math.ceil(incidentSubmissions.length / incidentItemsPerPage) || 1

  const paginatedChecklist = useMemo(() => {
    const start = (checklistPage - 1) * checklistItemsPerPage
    return checklistSubmissions.slice(start, start + checklistItemsPerPage)
  }, [checklistSubmissions, checklistPage, checklistItemsPerPage])

  const paginatedIncidents = useMemo(() => {
    const start = (incidentPage - 1) * incidentItemsPerPage
    return incidentSubmissions.slice(start, start + incidentItemsPerPage)
  }, [incidentSubmissions, incidentPage, incidentItemsPerPage])

  const handleViewSafetyReport = (submission: SafetyChecklistSubmission) => {
    setSelectedChecklist(submission)
    setIsViewSafetyModalOpen(true)
  }

  const handleReviewChecklist = (id: string) => {
    setChecklistSubmissions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: 'Reviewed' as const } : s))
    )
    setSelectedChecklist((prev) =>
      prev && prev.id === id ? { ...prev, status: 'Reviewed' } : prev
    )
  }

  const handleViewIncidentReport = (submission: IncidentReportSubmission) => {
    setSelectedIncident(submission)
    setIsViewIncidentModalOpen(true)
  }

  const handleViewTemplate = () => {
    setIsViewTemplateOpen(true)
  }

  const handleAddNewTemplateItem = () => {
    setIsViewTemplateOpen(false)
    setIsAddTemplateOpen(true)
  }

  const handleAddTemplateItem = (label: string) => {
    setTemplateItems((prev) => [
      ...prev,
      { id: `t-${Date.now()}`, label },
    ])
    setIsAddTemplateOpen(false)
  }

  const handleEditTemplateItem = (item: SafetyTemplateItem) => {
    setEditingTemplateItem(item)
  }

  const handleSaveEditTemplateItem = (id: string, label: string) => {
    setTemplateItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, label } : i))
    )
    setEditingTemplateItem(null)
  }

  const handleDeleteTemplateItem = (item: SafetyTemplateItem) => {
    setTemplateItems((prev) => prev.filter((i) => i.id !== item.id))
    setItemToDelete(null)
  }

  const openDeleteConfirm = (item: SafetyTemplateItem) => {
    setItemToDelete(item)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as ReportTab)} className="w-full">
        {/* Top Bar: Tabs + View Template */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <TabsList className="p-1 h-auto w-fit">
            <TabsTrigger
              value="checklist"
              className={cn(
                'px-5 py-2.5 rounded-lg text-sm font-medium transition-all',
                'data-[state=active]:bg-secondary data-[state=active]:text-white',
                'data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:bg-gray-100'
              )}
            >
              {t('dailySafetyReports.dailySafetyChecklist')}
            </TabsTrigger>
            <TabsTrigger
              value="incident"
              className={cn(
                'px-5 py-2.5 rounded-lg text-sm font-medium transition-all',
                'data-[state=active]:bg-secondary data-[state=active]:text-white',
                'data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:bg-gray-100'
              )}
            >
              {t('dailySafetyReports.incidentReport')}
            </TabsTrigger>
          </TabsList>

          <div className="relative">
            <Button
              className="bg-primary hover:bg-primary/90 text-white"
              onClick={handleViewTemplate}
            >
              {t('dailySafetyReports.viewTemplate')}
            </Button>
         
          </div>
        </div>

        {/* Recent Submissions */}
        <div className="mt-6">
          <h2 className="text-base font-bold text-foreground mb-4">{t('dailySafetyReports.recentSubmissions')}</h2>

          <TabsContent value="checklist" className="m-0">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {paginatedChecklist.map((submission, index) => (
                <motion.div
                  key={submission.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.02 * index }}
                >
                  <SafetyChecklistCard
                    submission={submission}
                    onViewReport={handleViewSafetyReport}
                  />
                </motion.div>
              ))}
            </div>
            <Pagination
              currentPage={checklistPage}
              totalPages={checklistTotalPages}
              totalItems={checklistSubmissions.length}
              itemsPerPage={checklistItemsPerPage}
              onPageChange={setChecklistPage}
              onItemsPerPageChange={setChecklistItemsPerPage}
            />
          </TabsContent>

          <TabsContent value="incident" className="m-0">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {paginatedIncidents.map((submission, index) => (
                <motion.div
                  key={submission.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.02 * index }}
                >
                  <IncidentReportCard
                    submission={submission}
                    onViewReport={handleViewIncidentReport}
                  />
                </motion.div>
              ))}
            </div>
            <Pagination
              currentPage={incidentPage}
              totalPages={incidentTotalPages}
              totalItems={incidentSubmissions.length}
              itemsPerPage={incidentItemsPerPage}
              onPageChange={setIncidentPage}
              onItemsPerPageChange={setIncidentItemsPerPage}
            />
          </TabsContent>
        </div>
      </Tabs>

      {/* Modals */}
      <ViewSafetyReportModal
        open={isViewSafetyModalOpen}
        onClose={() => {
          setIsViewSafetyModalOpen(false)
          setSelectedChecklist(null)
        }}
        submission={selectedChecklist}
        onReview={handleReviewChecklist}
      />

      <ViewIncidentDetailsModal
        open={isViewIncidentModalOpen}
        onClose={() => {
          setIsViewIncidentModalOpen(false)
          setSelectedIncident(null)
        }}
        submission={selectedIncident}
      />

      <ViewTemplateModal
        open={isViewTemplateOpen}
        onClose={() => {
          setIsViewTemplateOpen(false)
          setEditingTemplateItem(null)
        }}
        items={templateItems}
        onAddNew={handleAddNewTemplateItem}
        editingItem={editingTemplateItem}
        onEditStart={handleEditTemplateItem}
        onSaveEdit={handleSaveEditTemplateItem}
        onCancelEdit={() => setEditingTemplateItem(null)}
        onDelete={openDeleteConfirm}
      />

      <ConfirmDialog
        open={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        onConfirm={() => {
          if (itemToDelete) handleDeleteTemplateItem(itemToDelete)
        }}
        title={t('dailySafetyReports.deleteTemplateItem')}
        description={itemToDelete ? t('dailySafetyReports.deleteTemplateConfirm', { label: itemToDelete.label }) : ''}
        confirmText={t('common.delete')}
        cancelText={t('common.cancel')}
        variant="danger"
      />

      <AddTemplateModal
        open={isAddTemplateOpen}
        onClose={() => setIsAddTemplateOpen(false)}
        existingItems={templateItems}
        onAdd={handleAddTemplateItem}
      />
    </motion.div>
  )
}
