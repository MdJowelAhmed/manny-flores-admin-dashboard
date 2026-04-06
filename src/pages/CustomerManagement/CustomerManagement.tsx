import { useMemo, useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Plus, Eye, Pencil, Trash2, Shield } from 'lucide-react'
import { Pagination } from '@/components/common/Pagination'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { mockCustomerProjectsData } from './customerManagementData'
import { AddProjectModal } from './components/AddProjectModal'
import { ViewProjectDetailsModal } from './components/ViewProjectDetailsModal'
import type { CustomerProject } from '@/types'
import { formatCurrency } from '@/utils/formatters'
import { toast } from '@/utils/toast'
import { useTranslation } from 'react-i18next'
import { cn } from '@/utils/cn'

type ViewMode = 'staff' | 'client'

export default function CustomerManagement() {
  const { t } = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()
  const currentPage = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
  const itemsPerPage = Math.max(1, parseInt(searchParams.get('limit') || '10', 10))

  const [viewMode, setViewMode] = useState<ViewMode>('staff')

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

  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [selectedProject, setSelectedProject] = useState<CustomerProject | null>(null)
  const [projects, setProjects] = useState<CustomerProject[]>(mockCustomerProjectsData)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [projectToDelete, setProjectToDelete] = useState<CustomerProject | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const isStaffMode = viewMode === 'staff'

  useEffect(() => {
    if (!isStaffMode) {
      setIsAddModalOpen(false)
      setIsDeleteModalOpen(false)
      setProjectToDelete(null)
    }
  }, [isStaffMode])

  const totalPages = Math.max(1, Math.ceil(projects.length / itemsPerPage))

  useEffect(() => {
    if (currentPage > totalPages && totalPages >= 1) setPage(1)
  }, [totalPages, currentPage])

  const paginatedProjects = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return projects.slice(start, start + itemsPerPage)
  }, [projects, currentPage, itemsPerPage])

  const handleView = (project: CustomerProject) => {
    setSelectedProject(project)
    setIsViewModalOpen(true)
  }

  const handleDelete = (project: CustomerProject, e: React.MouseEvent) => {
    e.stopPropagation()
    setProjectToDelete(project)
    setIsDeleteModalOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!projectToDelete) return
    setIsDeleting(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 400))
      setProjects((prev) => prev.filter((p) => p.id !== projectToDelete.id))
      toast({
        variant: 'success',
        title: t('common.deleted'),
        description: t('customerManagement.deletedSuccess'),
      })
      setIsDeleteModalOpen(false)
      setProjectToDelete(null)
    } catch {
      toast({
        title: t('common.error'),
        description: t('customerManagement.deleteFailed'),
        variant: 'destructive',
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const handleAddProject = () => {
    setSelectedProject(null)
    setIsAddModalOpen(true)
  }

  const handleEditProject = (project: CustomerProject) => {
    setSelectedProject(project)
    setIsAddModalOpen(true)
  }

  const handleSaveProject = (data: Omit<CustomerProject, 'id'>) => {
    if (selectedProject) {
      setProjects((prev) =>
        prev.map((p) => (p.id === selectedProject.id ? { ...selectedProject, ...data } : p))
      )
    } else {
      const newProject: CustomerProject = {
        id: String(projects.length + 1),
        ...data,
      }
      setProjects((prev) => [newProject, ...prev])
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className=""
    >
      <div className="border-0">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between mb-6">
          <h1 className="text-xl font-bold text-slate-800">
            {t('customerManagement.recentProjects')}
          </h1>

          <div className="flex flex-wrap items-center gap-3 lg:justify-end">
            <div
              className="inline-flex rounded-full bg-gray-100 p-1"
              role="group"
              aria-label={t('customerManagement.staffMode')}
            >
              <button
                type="button"
                onClick={() => setViewMode('staff')}
                className={cn(
                  'rounded-full px-4 py-2 text-sm font-semibold transition-all',
                  isStaffMode
                    ? 'bg-white text-emerald-500 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                )}
              >
                {t('customerManagement.staffMode')}
              </button>
              <button
                type="button"
                onClick={() => setViewMode('client')}
                className={cn(
                  'rounded-full px-4 py-2 text-sm font-semibold transition-all',
                  !isStaffMode
                    ? 'bg-white text-emerald-500 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                )}
              >
                {t('customerManagement.clientMode')}
              </button>
            </div>

            {!isStaffMode && (
              <div
                className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-[11px] font-bold uppercase tracking-wide text-gray-400"
                role="status"
              >
                <Shield className="h-4 w-4 shrink-0" strokeWidth={1.75} />
                <span>{t('customerManagement.readOnlyAccess')}</span>
              </div>
            )}

            {isStaffMode && (
              <Button
                onClick={handleAddProject}
                className="bg-emerald-500 hover:bg-emerald-600 text-white"
              >
                <Plus className="h-4 w-4 mr-1" />
                {t('customerManagement.addProject')}
              </Button>
            )}
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] border-collapse">
              <thead>
                <tr className="bg-gray-50/90">
                  <th className="px-6 py-4 text-left text-sm font-bold text-slate-800">
                    {t('customerManagement.id')}
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-slate-800">
                    {t('customerManagement.customerName')}
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-slate-800">
                    {t('customerManagement.project')}
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-slate-800">
                    {t('customerManagement.amount')}
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-slate-800">
                    {t('customerManagement.projectDates')}
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-bold text-slate-800">
                    {t('customerManagement.action')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedProjects.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-12 text-center text-muted-foreground"
                    >
                      {t('customerManagement.noProjectsFound')}
                    </td>
                  </tr>
                ) : (
                  paginatedProjects.map((project, index) => (
                    <motion.tr
                      key={project.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.05 * index }}
                      className="hover:bg-gray-50 transition-colors shadow-sm"
                    >
                      <td className="px-6 py-3 text-sm text-slate-700">#{project.id}</td>
                      <td className="px-6 py-3 text-sm text-slate-700">
                        {project.customerName}
                      </td>
                      <td className="px-6 py-3 text-sm text-slate-700">{project.project}</td>
                      <td className="px-6 py-3 text-sm text-slate-700">
                        {formatCurrency(project.amount, 'EUR')}
                      </td>
                      <td className="px-6 py-3 text-sm text-slate-700">
                        {project.projectDate}
                      </td>
                      <td className="px-6 py-3 text-right">
                        <div
                          className={cn(
                            'flex items-center justify-end',
                            isStaffMode ? 'gap-1' : 'gap-0'
                          )}
                        >
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => handleView(project)}
                            className="h-9 w-9 hover:bg-gray-100"
                            aria-label={t('common.viewDetails')}
                          >
                            <Eye className="h-5 w-5 text-slate-600" />
                          </Button>
                          {isStaffMode && (
                            <>
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                onClick={() => handleEditProject(project)}
                                className="h-9 w-9 hover:bg-gray-100"
                                aria-label={t('common.edit')}
                              >
                                <Pencil className="h-5 w-5 text-slate-600" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                onClick={(e) => handleDelete(project, e)}
                                className="h-9 w-9 hover:bg-red-50"
                                aria-label={t('common.delete')}
                              >
                                <Trash2 className="h-5 w-5 text-red-600" />
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {projects.length > 0 && (
          <div className="border-t border-gray-100 pt-4 mt-4">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={projects.length}
              itemsPerPage={itemsPerPage}
              onPageChange={setPage}
              onItemsPerPageChange={setLimit}
            />
          </div>
        )}
      </div>

      <ViewProjectDetailsModal
        open={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false)
          setSelectedProject(null)
        }}
        project={selectedProject}
        isClientMode={!isStaffMode}
      />

      {isStaffMode && (
        <AddProjectModal
          open={isAddModalOpen}
          onClose={() => {
            setIsAddModalOpen(false)
            setSelectedProject(null)
          }}
          project={selectedProject}
          onSave={handleSaveProject}
        />
      )}

      {isStaffMode && (
        <ConfirmDialog
          open={isDeleteModalOpen}
          onClose={() => {
            setIsDeleteModalOpen(false)
            setProjectToDelete(null)
          }}
          onConfirm={handleConfirmDelete}
          title={t('customerManagement.deleteProject')}
          description={t('customerManagement.deleteConfirmation', {
            id: projectToDelete?.id,
          })}
          confirmText={t('common.delete')}
          variant="danger"
          isLoading={isDeleting}
        />
      )}
    </motion.div>
  )
}
