import { useState, useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Plus, Pencil, SlidersHorizontal, Trash2 } from 'lucide-react'
import { SearchInput } from '@/components/common/SearchInput'
import { Pagination } from '@/components/common/Pagination'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { projectStats, projectStatusFilterOptions } from './companyProjectsData'
import { useAppSelector } from '@/redux/hooks'
import { UserRole } from '@/types/roles'
import { ViewProjectDetailsModal } from './components/ViewProjectDetailsModal'
import { BuilderProjectDetailsModal } from './components/BuilderProjectDetailsModal'
import { ViewTasksModal } from './components/ViewTasksModal'
import { AddEditProjectModal } from './components/AddEditProjectModal'
import { AssignTeamModal } from './components/AssignTeamModal'
import { AddProjectTaskModal } from './components/AddProjectTaskModal'
import { formatCurrency } from '@/utils/formatters'
import { cn } from '@/utils/cn'
import { STATUS_COLORS } from '@/utils/constants'
import { useTranslation } from 'react-i18next'
import {
  useCompanyProjectOverviewQuery,
  useGetCompanyProjectsQuery,
  useGetCompanyProjectEmployeesQuery,
  useDeleteCompanyProjectMutation,
  type CompanyProjectApiDoc,
  type CompanyProjectTaskApiDoc,
} from '@/redux/api/companyProjectApi'
import { useGetBuildersQuery } from '@/redux/slices/super-admin/employeeManagement'
import Spinner from '@/components/common/Spinner'
import { differenceInWeeks, parseISO } from 'date-fns'
import { projectCardActionClass } from './companyProjectsUi'
import { sonnerToast } from '@/utils/toast'

export const getProjectDuration = (start?: string, end?: string) => {
  if (!start || !end) return 'N/A'
  try {
    const startDate = parseISO(start)
    const endDate = parseISO(end)
    const weeks = differenceInWeeks(endDate, startDate)
    return `${weeks} ${weeks === 1 ? 'week' : 'weeks'}`
  } catch {
    return 'N/A'
  }
}

export const mapProjectStatusToUi = (projectStatus?: string): string => {
  if (!projectStatus) return 'Pending'
  switch (projectStatus.toUpperCase()) {
    case 'PENDING':
      return 'Pending'
    case 'IN_PROGRESS':
      return 'In Progress'
    case 'ACTIVE':
      return 'Active'
    case 'COMPLETED':
      return 'Completed'
    case 'CANCELLED':
      return 'Cancelled'
    default:
      return projectStatus
  }
}

export const mapPaymentTypeToStatus = (paymentType?: string): string => {
  if (!paymentType) return 'Active'
  switch (paymentType.toUpperCase()) {
    case 'ACTIVE':
      return 'Active'
    case 'COMPLETED':
      return 'Completed'
    case 'PENDING':
      return 'Pending'
    case 'CANCELLED':
      return 'Cancelled'
    default:
      return 'Active'
  }
}

export default function CompanyProjects() {
  const { t } = useTranslation()
  const { user } = useAppSelector((state) => state.auth)
  const isBuilder = user?.role === UserRole.BUILDER
  const [searchParams, setSearchParams] = useSearchParams()

  const searchQuery = searchParams.get('search') ?? ''
  const statusFilter = searchParams.get('status') ?? 'all'
  const currentPage = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
  const itemsPerPage = Math.max(1, parseInt(searchParams.get('limit') || '10', 10)) || 10
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  const { data: companyOverviewRes, isLoading: companyOverviewLoading } =
    useCompanyProjectOverviewQuery()

  const { data: employeesRes } = useGetCompanyProjectEmployeesQuery({ limit: 200 })

  const { data: companyPorjectsApi, isLoading: companyProjectLoading, refetch } =
    useGetCompanyProjectsQuery({
      status: statusFilter === 'all' ? '' : statusFilter.toUpperCase(),
      page: currentPage,
      limit: itemsPerPage,
      search: searchQuery,
    })

  const projects = companyPorjectsApi?.data || []
  const totalItems = companyPorjectsApi?.pagination?.total || 0
  const totalPages = companyPorjectsApi?.pagination?.totalPage || 1

  const [builderSearch, setBuilderSearch] = useState('')
  const [builderPage, setBuilderPage] = useState(1)
  const [builderOptions, setBuilderOptions] = useState<
    { value: string; label: string; name: string; email: string }[]
  >([])

  const { data: buildersRes, isFetching: builderLoading } = useGetBuildersQuery(
    {
      search: builderSearch,
      page: builderPage,
      limit: 10,
    },
    {
      skip: !(isAddModalOpen || isEditModalOpen),
    }
  )

  const setSearch = (v: string) => {
    const next = new URLSearchParams(searchParams)
    v ? next.set('search', v) : next.delete('search')
    next.delete('page')
    setSearchParams(next, { replace: true })
  }
  const setStatus = (v: string) => {
    const next = new URLSearchParams(searchParams)
    v && v !== 'all' ? next.set('status', v) : next.delete('status')
    next.delete('page')
    setSearchParams(next, { replace: true })
  }
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

  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isViewTasksModalOpen, setIsViewTasksModalOpen] = useState(false)
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false)
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState<CompanyProjectTaskApiDoc | null>(null)
  const [selectedProject, setSelectedProject] = useState<CompanyProjectApiDoc | null>(null)
  const [projectToDelete, setProjectToDelete] = useState<CompanyProjectApiDoc | null>(null)

  const [deleteProject, { isLoading: isDeletingProject }] = useDeleteCompanyProjectMutation()

  const employeeOptions = useMemo(
    () =>
      employeesRes?.data?.map((emp) => ({
        id: emp.id,
        name: emp.name,
        email: emp.email,
        role: emp.role,
      })) ?? [],
    [employeesRes?.data]
  )

  const employeeNameById = useMemo(() => {
    const map: Record<string, string> = {}
    employeeOptions.forEach((emp) => {
      map[emp.id] = emp.name
    })
    return map
  }, [employeeOptions])

  useEffect(() => {
    if (currentPage > totalPages && totalPages >= 1) setPage(1)
  }, [totalPages, currentPage])

  const handleViewDetails = (project: CompanyProjectApiDoc) => {
    setSelectedProject(project)
    setIsViewModalOpen(true)
  }

  const handleViewTasks = (project: CompanyProjectApiDoc, e?: React.MouseEvent) => {
    e?.stopPropagation()
    setSelectedProject(project)
    setIsViewTasksModalOpen(true)
  }

  const handleAssignTeam = (project: CompanyProjectApiDoc, e?: React.MouseEvent) => {
    e?.stopPropagation()
    setSelectedProject(project)
    setIsAssignModalOpen(true)
  }

  const handleAddTask = () => {
    setSelectedTask(null)
    setIsTaskModalOpen(true)
  }

  const handleEditTask = (task: CompanyProjectTaskApiDoc) => {
    setSelectedTask(task)
    setIsTaskModalOpen(true)
  }

  const handleEdit = (project: CompanyProjectApiDoc, e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedProject(project)
    setIsEditModalOpen(true)
  }

  const handleAddProject = () => {
    setSelectedProject(null)
    setIsAddModalOpen(true)
  }

  const handleDelete = (project: CompanyProjectApiDoc, e: React.MouseEvent) => {
    e.stopPropagation()
    setProjectToDelete(project)
  }

  const handleConfirmDelete = async () => {
    if (!projectToDelete) return

    try {
      await sonnerToast.promise(
        deleteProject({ id: projectToDelete.id }).unwrap(),
        {
          loading: t('common.processing'),
          success: () => {
            if (selectedProject?.id === projectToDelete.id) {
              setSelectedProject(null)
              setIsViewModalOpen(false)
              setIsEditModalOpen(false)
              setIsViewTasksModalOpen(false)
              setIsAssignModalOpen(false)
            }
            setProjectToDelete(null)
            refetch()
            return t('companyProjects.projectDeleted')
          },
          error: (err: { data?: { message?: string } }) =>
            err?.data?.message || t('companyProjects.projectDeleteFailed'),
        }
      )
    } catch {
      // handled by sonnerToast
    }
  }

  const resetBuilderStates = () => {
    setBuilderSearch('')
    setBuilderPage(1)
    setBuilderOptions([])
  }

  if (companyProjectLoading || companyOverviewLoading) {
    return <Spinner />
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {projectStats?.map((stat, index) => {
          const Icon = stat.icon
          const value =
            stat.titleKey === 'companyProjects.totalProject'
              ? companyOverviewRes?.data?.totalProjects
              : stat.titleKey === 'companyProjects.activeProject'
                ? companyOverviewRes?.data?.activeProjects
                : stat.titleKey === 'companyProjects.cancelledProject'
                  ? companyOverviewRes?.data?.cancelledProjects
                  : companyOverviewRes?.data?.completedProjects
          return (
            <motion.div
              key={stat.titleKey}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="bg-white rounded-xl px-6 py-8 shadow-sm border border-gray-100"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-base font-medium text-muted-foreground">
                    {t(stat.titleKey)}
                  </p>
                  <h3 className="text-3xl font-bold text-foreground mt-1">{value}</h3>
                </div>
                <div className={cn('p-3 rounded-lg', stat.iconBgColor)}>
                  <Icon className={cn('h-8 w-8', stat.iconColor)} />
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      <div>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6">
          <h2 className="text-xl font-bold text-accent">{t('companyProjects.projectStatus')}</h2>
          <div className="flex items-center gap-3 flex-wrap">
            <SearchInput
              value={searchQuery}
              onChange={setSearch}
              placeholder={t('companyProjects.searchProject')}
              className="w-[280px] bg-white"
              debounceMs={150}
            />

            <div className="w-[120px]">
              <Select value={statusFilter} onValueChange={setStatus}>
                <SelectTrigger className="w-full bg-primary text-white hover:bg-primary/90 border-0">
                  <SlidersHorizontal className="h-4 w-4 mr-2" />
                  <SelectValue placeholder={t('companyProjects.filter')} />
                </SelectTrigger>
                <SelectContent>
                  {projectStatusFilterOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {t(option.labelKey)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {!isBuilder && (
              <Button
                onClick={handleAddProject}
                className="bg-primary hover:bg-primary/90 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                {t('companyProjects.addProject')}
              </Button>
            )}
          </div>
        </div>

        <div className="space-y-4">
          {projects.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              {t('companyProjects.noProjectsFound')}
            </div>
          ) : (
            projects.map((project: CompanyProjectApiDoc) => {
              const uiStatus = mapProjectStatusToUi(project.projectStatus)
              const statusColors = STATUS_COLORS[uiStatus] ?? {
                bg: 'bg-gray-100',
                text: 'text-gray-800',
              }

              return (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm"
                >
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                    <div className="flex-1 min-w-0 space-y-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <h4 className="text-lg font-bold text-gray-900 truncate">
                            {project.projectName}
                          </h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            {project.builder?.name || project.companyName || '—'}
                          </p>
                          {(project.builder?.email || project.customerEmail) && (
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {project.builder?.email || project.customerEmail}
                            </p>
                          )}
                        </div>
                        <span
                          className={cn(
                            'shrink-0 rounded-md px-3 py-1.5 text-xs font-semibold',
                            statusColors.bg,
                            statusColors.text
                          )}
                        >
                          {uiStatus}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-10">
                        <div>
                          <span className="text-sm text-muted-foreground block mb-1">
                            {t('companyProjects.budget')}
                          </span>
                          <span className="text-lg font-bold text-gray-900">
                            {formatCurrency(project.totalBudget)}
                          </span>
                        </div>
                        <div>
                          <span className="text-sm text-muted-foreground block mb-1">
                            {t('companyProjects.payAmount')}
                          </span>
                          <span className="text-lg font-bold text-gray-900">
                            {formatCurrency(project.payAmount ?? 0)}
                          </span>
                        </div>
                        <div>
                          <span className="text-sm text-muted-foreground block mb-1">
                            {t('companyProjects.amountDue')}
                          </span>
                          <span className="text-lg font-bold text-gray-900">
                            {formatCurrency(project.amountDue ?? 0)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 lg:justify-end lg:max-w-[520px]">
                      {isBuilder ? (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDetails(project)}
                          className={cn('h-9 rounded-lg border', projectCardActionClass.projectDetails)}
                        >
                          {t('companyProjects.viewDetails')}
                        </Button>
                      ) : (
                        <>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={(e) => handleViewTasks(project, e)}
                            className={cn('h-9 rounded-lg border', projectCardActionClass.viewTask)}
                          >
                            {t('companyProjects.viewTask')}
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={(e) => handleAssignTeam(project, e)}
                            className={cn('h-9 rounded-lg border', projectCardActionClass.assignEmployee)}
                          >
                            {t('companyProjects.assignEmployee')}
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewDetails(project)}
                            className={cn('h-9 rounded-lg border', projectCardActionClass.projectDetails)}
                          >
                            {t('companyProjects.projectDetails')}
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={(e) => handleEdit(project, e)}
                            className={cn('h-9 rounded-lg border', projectCardActionClass.edit)}
                          >
                            <Pencil className="h-3.5 w-3.5 mr-1.5" />
                            {t('common.edit')}
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={(e) => handleDelete(project, e)}
                            className={cn('h-9 rounded-lg border', projectCardActionClass.delete)}
                          >
                            <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                            {t('common.delete')}
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </motion.div>
              )
            })
          )}

          {projects.length > 0 && (
            <div className="border-t border-gray-100 pt-4">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalItems}
                itemsPerPage={itemsPerPage}
                onPageChange={setPage}
                onItemsPerPageChange={setLimit}
              />
            </div>
          )}
        </div>
      </div>

      {isBuilder ? (
        <BuilderProjectDetailsModal
          open={isViewModalOpen}
          onClose={() => {
            setIsViewModalOpen(false)
            setSelectedProject(null)
          }}
          projectId={selectedProject?.id ?? null}
          onDecisionComplete={refetch}
        />
      ) : (
        <>
          <ViewProjectDetailsModal
            open={isViewModalOpen}
            onClose={() => {
              setIsViewModalOpen(false)
              setSelectedProject(null)
            }}
            project={selectedProject}
            employeeNameById={employeeNameById}
          />

          <ViewTasksModal
            open={isViewTasksModalOpen}
            onClose={() => {
              setIsViewTasksModalOpen(false)
            }}
            project={selectedProject}
            onAddTask={handleAddTask}
            onEditTask={handleEditTask}
          />

          <AssignTeamModal
            open={isAssignModalOpen}
            onClose={() => {
              setIsAssignModalOpen(false)
            }}
            project={selectedProject}
            employees={employeeOptions}
            onAssigned={refetch}
          />

          <AddProjectTaskModal
            open={isTaskModalOpen}
            onClose={() => {
              setIsTaskModalOpen(false)
              setSelectedTask(null)
            }}
            project={selectedProject}
            task={selectedTask}
            employees={employeeOptions}
            onSaved={refetch}
          />

          <AddEditProjectModal
            open={isAddModalOpen || isEditModalOpen}
            onClose={() => {
              setIsAddModalOpen(false)
              setIsEditModalOpen(false)
              setSelectedProject(null)
              resetBuilderStates()
            }}
            project={isEditModalOpen ? selectedProject : null}
            refetch={refetch}
            buildersRes={buildersRes}
            builderPage={builderPage}
            builderOptions={builderOptions}
            setBuilderOptions={setBuilderOptions}
            setBuilderPage={setBuilderPage}
            setBuilderSearch={setBuilderSearch}
            builderLoading={builderLoading}
          />

          <ConfirmDialog
            open={!!projectToDelete}
            onClose={() => setProjectToDelete(null)}
            onConfirm={handleConfirmDelete}
            title={t('companyProjects.deleteProject')}
            description={t('companyProjects.deleteProjectConfirm', {
              name: projectToDelete?.projectName,
            })}
            confirmText={t('common.delete')}
            variant="danger"
            isLoading={isDeletingProject}
          />
        </>
      )}
    </motion.div>
  )
}
