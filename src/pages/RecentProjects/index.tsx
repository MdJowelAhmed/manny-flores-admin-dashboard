import { useMemo, useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Eye, Trash2 } from 'lucide-react'
import { Pagination } from '@/components/common/Pagination'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import {
  recentProjectsData,
  type RecentProject,
} from './recentProjectsData'
import { ProjectViewDetailsModal } from './components/ProjectViewDetailsModal'
export default function RecentProjects() {
  const [searchParams, setSearchParams] = useSearchParams()
  const currentPage = Math.max(
    1,
    parseInt(searchParams.get('page') || '1', 10)
  )
  const itemsPerPage =
    parseInt(searchParams.get('limit') || '10', 10) || 10

  const [showViewModal, setShowViewModal] = useState(false)
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

  const handleConfirmDelete = () => {
    if (!selectedProject) return
    setProjects((prev) => prev.filter((p) => p.id !== selectedProject.id))
    setSelectedProject(null)
    setShowDeleteModal(false)
  }

  const getStatusClasses = (status: string) => {
    if (status === 'In Progress')
      return 'bg-purple-100 text-purple-600'
    if (status === 'Pending Approval') return 'bg-red-100 text-red-500'
    return 'bg-green-100 text-green-600'
  }

  return (
    <div className="space-y-6">
      <Card className="bg-white border-0">
       
        <CardContent className="p-0">
          <div className="w-full overflow-auto">
            <table className="w-full min-w-[980px]">
              <thead>
                <tr className="bg-secondary-foreground text-accent">
                  <th className="px-6 py-4 text-left text-sm font-bold">ID</th>
                  <th className="px-6 py-4 text-left text-sm font-bold">
                    Customer Name
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold">
                    Project
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold">
                    Progress
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold">
                    Value
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold">
                    Action
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
                    <td className="px-6 py-5">
                      <span
                        className={`inline-flex items-center justify-center rounded-full px-3 py-1 text-xs font-medium ${getStatusClasses(
                          project.status
                        )}`}
                      >
                        {project.status}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="h-2 w-24 rounded-full bg-gray-100 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              project.status === 'In Progress'
                                ? 'bg-green-500'
                                : project.status === 'Completed'
                                  ? 'bg-green-500'
                                  : 'bg-gray-300'
                            }`}
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

      <ConfirmDialog
        open={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false)
          setSelectedProject(null)
        }}
        onConfirm={handleConfirmDelete}
        title="Are you Sure?"
        description="Do you really want to delete these records? This process cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  )
}
