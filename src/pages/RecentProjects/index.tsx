import { useMemo, useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Eye, Trash2 } from 'lucide-react'
import { Pagination } from '@/components/common/Pagination'
import { SearchInput } from '@/components/common/SearchInput'
import Spinner from '@/components/common/Spinner'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import type { RecentProject, ProjectStatus } from './recentProjectsData'
import { ProjectViewDetailsModal } from './components/ProjectViewDetailsModal'
import { ProjectPlanUploadModal } from './components/ProjectPlanUploadModal'
import {
  getProjectStatusBadgeStyle,
  getProjectStatusTranslationKey,
} from './projectStatus'
import { useOverviewRecentProjectsQuery } from '@/redux/slices/super-admin/overviewApi'

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
  const [deletedIds, setDeletedIds] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm)
      // Reset page to 1 on search change
      const next = new URLSearchParams(searchParams)
      next.delete('page')
      setSearchParams(next, { replace: true })
    }, 400)
    return () => clearTimeout(handler)
  }, [searchTerm])

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

  // API CALL
  const { data: recentProjectsApi, isLoading: recentProjectsLoading } = useOverviewRecentProjectsQuery({
    limit: itemsPerPage,
    page: currentPage,
    search: debouncedSearch,
  })

  const apiData = recentProjectsApi?.data || []
  const pagination = recentProjectsApi?.pagination || { total: 0, page: 1, limit: 10, totalPage: 1 }

  const mappedProjects = useMemo(() => {
    return apiData.map((item: any) => {
      const mapStatus = (status: string): ProjectStatus => {
        switch (status) {
          case 'COMPLETED':
            return 'Completed'
          case 'IN_PROGRESS':
            return 'In Progress'
          case 'SCHEDULED':
            return 'Scheduled'
          case 'PENDING':
            return 'Pending Approval'
          default:
            return 'Scheduled'
        }
      }
      return {
        id: item.id ? (item.id.includes('-') ? `#${item.id.split('-')[0]}` : `#${item.id.slice(0, 8)}`) : '#N/A',
        customerName: item.customerName || 'N/A',
        project: item.projectName || 'N/A',
        status: mapStatus(item.projectStatus),
        progress: item.projectStatus === 'COMPLETED' ? 100 : item.projectStatus === 'IN_PROGRESS' ? 60 : item.projectStatus === 'PENDING' ? 15 : 0,
        value: item.totalCost ? `$${item.totalCost}` : '$0',
        startDate: item.estimateStartDate ? new Date(item.estimateStartDate).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' }).replace(/\//g, '.') : 'N/A',
        endDate: item.estimateEndDate ? new Date(item.estimateEndDate).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' }).replace(/\//g, '.') : 'N/A',
        email: item.customerEmail,
        company: item.customerName,
        projectName: item.projectName,
        description: item.description,
        planFiles: [],
        originalId: item.id
      }
    })
  }, [apiData])

  const visibleProjects = useMemo(() => {
    return mappedProjects.filter((p: any) => !deletedIds.includes(p.originalId))
  }, [mappedProjects, deletedIds])

  const totalItems = pagination.total || 0
  const totalPages = pagination.totalPage || 1

  const handleViewDetails = (project: RecentProject) => {
    setSelectedProject(project)
    setShowViewModal(true)
  }

  const handleDeleteClick = (project: RecentProject) => {
    setSelectedProject(project)
    setShowDeleteModal(true)
  }



  const handleConfirmDelete = () => {
    if (!selectedProject) return
    // removeProject(selectedProject.id)
    const proj = selectedProject as any
    if (proj.originalId) {
      setDeletedIds(prev => [...prev, proj.originalId])
    }
    setSelectedProject(null)
    setShowDeleteModal(false)
  }

  const resolvedViewProject: RecentProject | null = selectedProject
    ? (visibleProjects.find((p: any) => p.id === selectedProject.id) as any) ?? selectedProject
    : null

  return (
    <div className="space-y-6">
      <Card className="bg-white border-0">
        <CardHeader className="flex flex-row items-center justify-between pb-6">
          <CardTitle className="text-xl font-bold text-slate-800">
            {t('recentProjectsPage.title')}
          </CardTitle>
          <div className="flex items-center gap-3">
            <SearchInput
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder={t('recentProjectsPage.searchProjects')}
              className="w-[300px]"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {recentProjectsLoading ? (
            <div className="flex items-center justify-center p-12 min-h-[300px]">
              <Spinner />
            </div>
          ) : (
            <>
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
                        {t('recentProjectsPage.action')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-slate-700">
                    {visibleProjects.map((project: any) => (
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
                            className="inline-flex items-center justify-center rounded-full px-3 py-1 text-xs font-medium"
                            style={getProjectStatusBadgeStyle(project.status)}
                          >
                            {t(getProjectStatusTranslationKey(project.status))}
                          </span>
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
            </>
          )}
        </CardContent>
      </Card>

      <ProjectViewDetailsModal
        open={showViewModal}
        onClose={() => {
          setShowViewModal(false)
          setSelectedProject(null)
        }}
        project={resolvedViewProject}
        onRemovePlanFile={
          resolvedViewProject
            ? () => { }
            : undefined
        }
      />

      <ProjectPlanUploadModal
        open={showPlanModal}
        onClose={() => {
          setShowPlanModal(false)
          setSelectedProject(null)
        }}
        project={selectedProject}
        onUploadSuccess={() => { }}
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
