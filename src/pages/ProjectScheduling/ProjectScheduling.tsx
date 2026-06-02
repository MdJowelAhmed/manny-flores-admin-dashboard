import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import {
  Calendar,
  Eye,
  Loader2,

  Users,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { ViewScheduleDetailsModal } from './components/ViewScheduleDetailsModal'
import {
  AddEditScheduleModal,
  type RescheduleFormValues,
} from './components/AddEditScheduleModal'
import { AssignEmployeeModal } from './components/AssignEmployeeModal'
import { AddTeamModal } from './components/AddTeamModal'
import { ViewTeamListModal } from './components/ViewTeamListModal'
import { Pagination } from '@/components/common/Pagination'
import type { ScheduledProject } from './projectSchedulingData'
import { consumePendingSchedules } from '@/pages/Estimate/estimateBridge'
import { cn } from '@/utils/cn'
import type { Employee } from '@/types'
import { toast } from '@/utils/toast'
import {
  mapProjectFromApi,
  useAssignProjectEmployeeMutation,
  useCompleteProjectMutation,
  useGetAllEmployeesQuery,
  useGetScheduledProjectsQuery,
  useReScheduleProjectMutation,
} from '@/redux/api/projectsApi'
import { useGetTeamsQuery } from '@/redux/api/teamApi'
import { getProjectStatusClasses } from '@/pages/Estimate/estimateData'
import { formatDateDisplay } from '@/utils/formatters'

function teamBadgeLabel(team: string) {
  const raw = team.trim()
  if (!raw) return ''
  if (/^\d+$/.test(raw)) return `CREW ${raw}`
  return raw.toUpperCase()
}

function formatIsoDate(iso?: string): string {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return formatDateDisplay(d)
}

function isProjectCompleted(schedule: ScheduledProject): boolean {
  return (
    schedule.status === 'COMPLETED' ||
    schedule.projectStatus === 'COMPLETED'
  )
}

export default function ProjectScheduling() {
  const { t } = useTranslation()
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [pendingSchedules] = useState(() => consumePendingSchedules())

  const { data: projectsResponse, isLoading, isFetching, refetch } = useGetScheduledProjectsQuery({
    page,
    limit,
  })

  const { data: employeesResponse } = useGetAllEmployeesQuery({ page: 1, limit: 100 })

  const [reScheduleProject, { isLoading: isRescheduling }] = useReScheduleProjectMutation()
  const [assignProjectEmployee, { isLoading: isAssigning }] = useAssignProjectEmployeeMutation()
  const [completeProject, { isLoading: isCompleting }] = useCompleteProjectMutation()

  const [selectedSchedule, setSelectedSchedule] = useState<ScheduledProject | null>(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false)
  const [rescheduleTarget, setRescheduleTarget] = useState<ScheduledProject | null>(null)
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false)
  const [assignTarget, setAssignTarget] = useState<ScheduledProject | null>(null)
  const [isAddTeamModalOpen, setIsAddTeamModalOpen] = useState(false)
  const [isViewTeamsModalOpen, setIsViewTeamsModalOpen] = useState(false)

  const { data: teamsResponse } = useGetTeamsQuery({ page: 1, limit: 100 })

  /** Every employee that is already on some other team. The API rule is
   *  "one employee can belong to a single team only" — these IDs are
   *  filtered out of the AddTeam dropdown / search. */
  const blockedEmployeeIds = useMemo(() => {
    const set = new Set<string>()
    teamsResponse?.data?.forEach((team) =>
      team.employees?.forEach((emp) => emp.id && set.add(emp.id))
    )
    return Array.from(set)
  }, [teamsResponse?.data])

  const schedules = useMemo(() => {
    const apiSchedules = (projectsResponse?.data ?? []).map(mapProjectFromApi)
    const apiIds = new Set(apiSchedules.map((s) => s.id))
    const localOnly = pendingSchedules.filter((s) => !apiIds.has(s.id))
    return [...localOnly, ...apiSchedules]
  }, [projectsResponse?.data, pendingSchedules])

  const totalItems = projectsResponse?.pagination?.total ?? schedules.length
  const totalPages = projectsResponse?.pagination?.totalPage ?? 1

  const employees: Employee[] = useMemo(() => {
    return (
      employeesResponse?.data?.map((employee) => ({
        id: employee.id,
        employeeId: employee.id.slice(0, 8),
        fullName: employee.name,
        email: employee.email,
        department: employee.city || 'N/A',
        status: employee.isBanned ? 'inactive' : 'Active',
        joiningDate: employee.createdAt,
        role: employee.role,
        workSchedule: employee.country || 'N/A',
        contact: employee.contact ?? undefined,
        verified: employee.verified,
        isBanned: !!employee.isBanned,
      })) ?? []
    )
  }, [employeesResponse?.data])

  const groupedByDate = useMemo(() => {
    const map = new Map<string, ScheduledProject[]>()
    schedules.forEach((s) => {
      const list = map.get(s.scheduledDate) ?? []
      list.push(s)
      map.set(s.scheduledDate, list)
    })
    return Array.from(map.entries()).sort((a, b) => {
      const da = new Date(a[0]).getTime()
      const db = new Date(b[0]).getTime()
      return da - db
    })
  }, [schedules])

  const handleViewDetails = (schedule: ScheduledProject) => {
    setSelectedSchedule(schedule)
    setIsViewModalOpen(true)
  }

  const handleReschedule = (schedule: ScheduledProject) => {
    setRescheduleTarget(schedule)
    setIsRescheduleModalOpen(true)
  }



  const handleRescheduleSubmit = async (
    estimateId: string,
    values: RescheduleFormValues
  ) => {
    await reScheduleProject({ estimateId, body: values }).unwrap()
    refetch()
  }

  const handleAssignEmployee = async (projectId: string, employeeId: string) => {
    try {
      await assignProjectEmployee({ projectId, body: { employeeId } }).unwrap()
      toast({
        title: t('common.success'),
        description: t('projectScheduling.employeeAssigned'),
        variant: 'success',
      })
      refetch()
    } catch {
      toast({
        title: t('common.error'),
        description: t('projectScheduling.assignEmployeeFailed'),
        variant: 'destructive',
      })
      throw new Error('assign failed')
    }
  }

  const handleCompleteProject = async (schedule: ScheduledProject) => {
    try {
      await completeProject({
        projectId: schedule.id,
        body: { projectStatus: 'COMPLETED' },
      }).unwrap()
      toast({
        title: t('common.success'),
        description: t('projectScheduling.projectCompleted'),
        variant: 'success',
      })
      refetch()
    } catch {
      toast({
        title: t('common.error'),
        description: t('projectScheduling.completeProjectFailed'),
        variant: 'destructive',
      })
    }
  }

  const loading = isLoading || isFetching

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 min-h-[60vh] rounded-xl bg-muted/30 p-4 sm:p-6 -mx-4 sm:mx-0 border border-transparent"
    >
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            {t('projectScheduling.title')}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t('projectScheduling.subtitle')}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="outline"
            onClick={() => setIsViewTeamsModalOpen(true)}
            className="shrink-0 rounded-lg h-11 px-5 border-gray-200 text-gray-900 hover:bg-muted/50"
          >
            <Eye className="h-4 w-4 mr-2" />
            {t('projectScheduling.viewTeamList', 'View team list')}
          </Button>
          <Button
            onClick={() => setIsAddTeamModalOpen(true)}
            className="shrink-0 rounded-lg h-11 px-5 bg-primary hover:bg-primary/90 text-white"
          >
            <Users className="h-4 w-4 mr-2" />
            {t('projectScheduling.addTeam')}
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="space-y-8">
          {groupedByDate.map(([date, items]) => (
            <div key={date} className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <Calendar className="h-5 w-5 shrink-0 text-blue-500" aria-hidden />
                  <span className="text-base font-semibold text-gray-900 truncate">{date}</span>
                </div>
                <span
                  className={cn(
                    'text-xs font-semibold shrink-0 px-2.5 py-1 rounded-full',
                    'bg-primary/15 text-primary border border-primary/20'
                  )}
                >
                  {items.length === 1
                    ? t('projectScheduling.projectsCount', { count: items.length })
                    : t('projectScheduling.projectsCountPlural', { count: items.length })}
                </span>
              </div>

              <div className="space-y-4">
                {items.map((schedule) => {
                  const statusStyle = getProjectStatusClasses(schedule.projectStatus)
                  const completed = isProjectCompleted(schedule)

                  return (
                    <div
                      key={schedule.id}
                      className="rounded-xl border border-gray-200/90 bg-white p-4 sm:p-5 shadow-sm"
                    >
                      <div className="flex flex-col xl:flex-row xl:items-stretch gap-5 xl:gap-8">
                        <div className="flex-1 min-w-0 space-y-4">
                          <div className="flex flex-wrap items-start gap-2">
                            <div className="min-w-0 flex-1">
                              <h2 className="text-base font-semibold text-gray-900 leading-snug">
                                {schedule.projectTitle || '—'}
                              </h2>
                              {schedule.category && (
                                <p className="text-sm text-muted-foreground mt-0.5">
                                  {schedule.category}
                                </p>
                              )}
                            </div>
                            <span
                              className={cn(
                                'text-xs font-semibold px-2.5 py-1 rounded-full shrink-0',
                                statusStyle.text,
                                'bg-muted/60'
                              )}
                            >
                              {t(`estimate.projectStatus.${schedule.projectStatus}`)}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-4">
                            <div>
                              <span className="text-xs text-muted-foreground block mb-1">
                                {t('projectScheduling.startDate')}
                              </span>
                              <span className="text-sm font-medium text-gray-900">
                                {formatIsoDate(schedule.estimateStartDate)}
                              </span>
                            </div>
                            <div>
                              <span className="text-xs text-muted-foreground block mb-1">
                                {t('projectScheduling.endDate')}
                              </span>
                              <span className="text-sm font-medium text-gray-900">
                                {formatIsoDate(schedule.estimateEndDate)}
                              </span>
                            </div>
                            <div>
                              <span className="text-xs text-muted-foreground block mb-1">
                                {t('projectScheduling.uploadDate')}
                              </span>
                              <span className="text-sm font-medium text-gray-900">
                                {schedule.uploadDate}
                              </span>
                            </div>
                            {schedule.uploadedBy && (
                              <div>
                                <span className="text-xs text-muted-foreground block mb-1">
                                  {t('projectScheduling.client')}
                                </span>
                                <span className="text-sm font-medium text-gray-900">
                                  {schedule.uploadedBy}
                                </span>
                              </div>
                            )}
                            {schedule.serviceLocation && (
                              <div className="col-span-2 lg:col-span-1">
                                <span className="text-xs text-muted-foreground block mb-1">
                                  {t('projectScheduling.serviceLocation')}
                                </span>
                                <span className="text-sm font-medium text-gray-900 leading-snug">
                                  {schedule.serviceLocation}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="rounded-xl bg-[#F1F1F1] border border-gray-200/80 p-3.5 flex flex-col min-h-[120px] w-full sm:w-72">
                          <div className="flex items-center justify-between gap-2 mb-3">
                            <span className="text-[10px] font-bold tracking-wide text-muted-foreground uppercase">
                              {t('projectScheduling.assignedEmployees')}
                            </span>
                            {schedule.team ? (
                              <span
                                className={cn(
                                  'text-[10px] font-bold px-2 py-0.5 rounded-full',
                                  'bg-primary/15 text-primary'
                                )}
                              >
                                {teamBadgeLabel(schedule.team)}
                              </span>
                            ) : null}
                          </div>

                          <div className="flex flex-wrap items-center -mx-1 mb-3">
                            {schedule.assignedEmployees.map((emp) => {
                              const initials = (emp.name || '—')
                                .split(' ')
                                .map((part) => part[0])
                                .filter(Boolean)
                                .slice(0, 2)
                                .join('')
                                .toUpperCase()
                              return (
                                <Tooltip key={`${schedule.id}-emp-${emp.id}`}>
                                  <TooltipTrigger asChild>
                                    <Avatar className="h-9 w-9 border-2 border-white shadow-sm cursor-pointer">
                                      {emp.profileUrl ? (
                                        <AvatarImage src={emp.profileUrl} alt={emp.name} />
                                      ) : null}
                                      <AvatarFallback className="text-xs">
                                        {initials || '?'}
                                      </AvatarFallback>
                                    </Avatar>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <div className="text-xs font-medium">{emp.name}</div>
                                    {emp.email && (
                                      <div className="text-[10px] text-muted-foreground">
                                        {emp.email}
                                      </div>
                                    )}
                                  </TooltipContent>
                                </Tooltip>
                              )
                            })}
                            {/* {!completed && (
                              <button
                                type="button"
                                onClick={() => handleOpenAssign(schedule)}
                                className={cn(
                                  'h-9 w-9 rounded-full border-2 border-dashed border-muted-foreground/35',
                                  'flex items-center justify-center text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors'
                                )}
                                aria-label={t('projectScheduling.addCrewMember')}
                              >
                                <Plus className="h-4 w-4" />
                              </button>
                            )} */}
                          </div>

                          {/* <div className="mt-auto pt-2">
                            <div className="flex items-center justify-between gap-2 rounded-lg bg-white border border-gray-100 px-3 py-2 shadow-sm">
                              <div className="flex items-center gap-2 min-w-0">
                                <CalendarClock
                                  className="h-4 w-4 shrink-0 text-primary"
                                  aria-hidden
                                />
                                <span className="text-xs font-medium text-gray-900 truncate">
                                  {t('projectScheduling.etaLabel', { time: schedule.eta })}
                                </span>
                              </div>
                              <button
                                type="button"
                                className="shrink-0 p-1 rounded-md text-blue-500 hover:bg-blue-50 transition-colors"
                                aria-label={t('projectScheduling.sendNotification')}
                              >
                                <Send className="h-4 w-4" />
                              </button>
                            </div>
                          </div> */}
                        </div>

                        <div className="flex flex-col w-full xl:w-[min(100%,280px)] shrink-0 xl:self-stretch">
                          <div className="mt-auto flex flex-wrap justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-9 rounded-lg border-gray-200 text-gray-900 hover:bg-muted/50"
                              onClick={() => handleViewDetails(schedule)}
                            >
                              {t('projectScheduling.viewDetails')}
                            </Button>
                            {!completed && (
                              <>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-9 rounded-lg border-gray-200 text-gray-900 hover:bg-muted/50"
                                  onClick={() => handleReschedule(schedule)}
                                >
                                  {t('projectScheduling.reschedule')}
                                </Button>
                                <Button
                                  size="sm"
                                  className="h-9 rounded-lg bg-primary hover:bg-primary/90 text-white"
                                  disabled={isCompleting}
                                  onClick={() => handleCompleteProject(schedule)}
                                >
                                  {t('projectScheduling.markComplete')}
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}

          {groupedByDate.length === 0 && (
            <div className="py-16 text-center text-muted-foreground text-sm rounded-xl border border-dashed bg-white/50">
              {t('projectScheduling.noScheduledProjects')}
            </div>
          )}

          {totalItems > 0 && (
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              totalItems={totalItems}
              itemsPerPage={limit}
              onPageChange={setPage}
              onItemsPerPageChange={(newLimit) => {
                setLimit(newLimit)
                setPage(1)
              }}
            />
          )}
        </div>
      )}

      <ViewScheduleDetailsModal
        open={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false)
          setSelectedSchedule(null)
        }}
        schedule={selectedSchedule}
      />

      <AddEditScheduleModal
        open={isRescheduleModalOpen}
        onClose={() => {
          setIsRescheduleModalOpen(false)
          setRescheduleTarget(null)
        }}
        schedule={rescheduleTarget}
        onReschedule={handleRescheduleSubmit}
        isSaving={isRescheduling}
      />

      <AssignEmployeeModal
        open={isAssignModalOpen}
        onClose={() => {
          setIsAssignModalOpen(false)
          setAssignTarget(null)
        }}
        schedule={assignTarget}
        employees={employees}
        onAssign={handleAssignEmployee}
        isSaving={isAssigning}
      />

      <AddTeamModal
        open={isAddTeamModalOpen}
        onClose={() => setIsAddTeamModalOpen(false)}
        employees={employees}
        blockedEmployeeIds={blockedEmployeeIds}
      />

      <ViewTeamListModal
        open={isViewTeamsModalOpen}
        onClose={() => setIsViewTeamsModalOpen(false)}
        employees={employees}
      />
    </motion.div>
  )
}
