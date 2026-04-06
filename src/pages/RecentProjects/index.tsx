import { useMemo, useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Card, CardContent } from '@/components/ui/card'
import { Eye, Trash2 } from 'lucide-react'
import { Pagination } from '@/components/common/Pagination'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import {
  recentProjectsData,
  type RecentProject,
} from './recentProjectsData'
import { ProjectViewDetailsModal } from './components/ProjectViewDetailsModal'
import { ProjectPlanUploadModal } from './components/ProjectPlanUploadModal'
import {
  getProjectStatusBadgeClass,
  getProjectStatusTranslationKey,
} from './projectStatus'

export default function RecentProjects() {
  const { t } = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()
  const currentPage = Math.max(
    1,
    parseInt(searchParams.get('page') || '1', 10)
  )
  const itemsPerPage =
    parseInt(searchParams.get('limit') || '10', 10) || 10

  const [showViewModal, setShowViewModal] = useState(false)
  const [showPlanModal, setShowPlanModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedProject, setSelectedProject] = useState<RecentProject | null>(
    null
  )
  const [projects, setProjects] = useState<RecentProject[]>(recentProjectsData)

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

  const totalItems = projects.length
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage))

  useEffect(() => {
    if (currentPage > totalPages && totalPages >= 1) setPage(1)
  }, [totalPages, currentPage])

  const paginatedProjects = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return projects.slice(start, start + itemsPerPage)
  }, [projects, currentPage, itemsPerPage])

  const handleViewDetails = (project: RecentProject) => {
    setSelectedProject(project)
    setShowViewModal(true)
  }

  const handleDeleteClick = (project: RecentProject) => {
    setSelectedProject(project)
    setShowDeleteModal(true)
  }

  const handleUploadPlan = (project: RecentProject) => {
    setSelectedProject(project)
    setShowPlanModal(true)
  }

  const handleConfirmDelete = () => {
    if (!selectedProject) return
    setProjects((prev) => prev.filter((p) => p.id !== selectedProject.id))
    setSelectedProject(null)
    setShowDeleteModal(false)
  }

  return (
    <div className="space-y-6">
      <Card className="bg-white border-0">
       
        <CardContent className="p-0">
          <div className="w-full overflow-auto">
            <table className="w-full min-w-[1180px]">
              <thead>
                <tr className="bg-secondary-foreground text-accent">
                  <th className="px-6 py-4 text-left text-sm font-bold">{t('recentProjectsPage.id')}</th>
                  <th className="px-6 py-4 text-left text-sm font-bold">
                    {t('recentProjectsPage.customerName')}
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold">
                    {t('recentProjectsPage.project')}
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold">
                    {t('recentProjectsPage.startDate')}
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold">
                    {t('recentProjectsPage.endDate')}
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold">
                    {t('recentProjectsPage.status')}
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold">
                    {t('recentProjectsPage.progress')}
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold">
                    {t('recentProjectsPage.value')}
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold">
                    {t('recentProjectsPage.projectPlan')}
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold">
                    {t('recentProjectsPage.action')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-slate-700">
                {paginatedProjects.map((project) => (
                  <tr
                    key={project.id}
                    className="hover:bg-gray-50/50 transition-colors shadow-sm"
                  >
                    <td className="px-6 py-5 text-sm font-medium">
                      {project.id}
                    </td>
                    <td className="px-6 py-5 text-sm">
                      {project.customerName}
                    </td>
                    <td className="px-6 py-5 text-sm">{project.project}</td>
                    <td className="px-6 py-5 text-sm whitespace-nowrap">
                      {project.startDate}
                    </td>
                    <td className="px-6 py-5 text-sm whitespace-nowrap">
                      {project.endDate}
                    </td>
                    <td className="px-6 py-5">
                      <span
                        className={`inline-flex items-center justify-center rounded-full px-3 py-1 text-xs font-medium ${getProjectStatusBadgeClass(
                          project.status
                        )}`}
                      >
                        {t(getProjectStatusTranslationKey(project.status))}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="h-2 w-24 min-w-[6rem] rounded-full bg-gray-100 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-emerald-500"
                            style={{ width: `${project.progress}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-600">
                          {project.progress}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-sm font-medium">
                      {project.value}
                    </td>
                    <td className="px-6 py-5">
                      <button
                        type="button"
                        onClick={() => handleUploadPlan(project)}
                        className="rounded-md bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-emerald-600"
                      >
                        {t('recentProjectsPage.uploadPlan')}
                      </button>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => handleViewDetails(project)}
                          className="text-gray-400 hover:text-gray-600 transition-colors"
                          aria-label="View details"
                        >
                          <Eye className="h-5 w-5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteClick(project)}
                          className="text-red-400 hover:text-red-600 transition-colors"
                          aria-label="Delete"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={setPage}
            onItemsPerPageChange={setLimit}
            showItemsPerPage
          />
        </CardContent>
      </Card>

      <ProjectViewDetailsModal
        open={showViewModal}
        onClose={() => {
          setShowViewModal(false)
          setSelectedProject(null)
        }}
        project={selectedProject}
      />

      <ProjectPlanUploadModal
        open={showPlanModal}
        onClose={() => {
          setShowPlanModal(false)
          setSelectedProject(null)
        }}
        project={selectedProject}
      />

      <ConfirmDialog
        open={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false)
          setSelectedProject(null)
        }}
        onConfirm={handleConfirmDelete}
        title={t('common.areYouSure')}
        description={t('common.deleteConfirmation')}
        confirmText={t('common.delete')}
        cancelText={t('common.cancel')}
        variant="danger"
      />
    </div>
  )
}
