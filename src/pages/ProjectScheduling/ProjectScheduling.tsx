import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import {
  Calendar,
  CalendarClock,
  Plus,
  Send,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ViewScheduleDetailsModal } from './components/ViewScheduleDetailsModal'
import { AddEditScheduleModal } from './components/AddEditScheduleModal'
import { mockScheduledProjects, type ScheduledProject } from './projectSchedulingData'
import { cn } from '@/utils/cn'

function teamBadgeLabel(team: string) {
  const raw = team.trim()
  if (!raw) return ''
  const u = raw.toUpperCase()
  return u.startsWith('TEAM') ? u : `TEAM ${u}`
}

export default function ProjectScheduling() {
  const { t } = useTranslation()
  const [schedules, setSchedules] = useState<ScheduledProject[]>(mockScheduledProjects)
  const [selectedSchedule, setSelectedSchedule] = useState<ScheduledProject | null>(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false)
  const [editSchedule, setEditSchedule] = useState<ScheduledProject | null>(null)

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
    setEditSchedule(schedule)
    setIsAddEditModalOpen(true)
  }

  const handleAddScheduled = () => {
    setEditSchedule(null)
    setIsAddEditModalOpen(true)
  }

  const handleSaveSchedule = (data: Partial<ScheduledProject>) => {
    if (data.id) {
      const newDate = data.uploadDate ?? ''
      setSchedules((prev) =>
        prev.map((s) =>
          s.id === data.id
            ? {
              ...s,
              projectTitle: data.projectTitle ?? s.projectTitle,
              project: data.projectTitle ?? s.project,
              uploadDate: newDate || s.uploadDate,
              scheduledDate: newDate || s.scheduledDate,
              uploadedBy: data.uploadedBy ?? s.uploadedBy,
              customer: data.uploadedBy ?? s.customer,
              email: data.email ?? s.email,
              company: data.company ?? s.company,
              team: data.team ?? s.team,
            }
            : s
        )
      )
    } else {
      const sd = data.uploadDate
        ?? new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      const name = data.projectTitle ?? ''
      const newSchedule: ScheduledProject = {
        id: `sch-${Date.now()}`,
        scheduledDate: sd,
        projectTitle: name,
        category: 'General',
        project: name,
        uploadDate: data.uploadDate ?? sd,
        uploadedBy: data.uploadedBy ?? '',
        team: data.team ?? '',
        customer: data.uploadedBy ?? '',
        email: data.email ?? '',
        company: data.company ?? '',
        serviceLocation: '',
        eta: '09:00 AM',
        assignedAvatarUrls: [],
      }
      setSchedules((prev) => [newSchedule, ...prev])
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 min-h-[60vh] rounded-xl bg-muted/30 p-4 sm:p-6 -mx-4 sm:mx-0 border border-transparent"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {t('projectScheduling.title')}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t('projectScheduling.subtitle')}
          </p>
        </div>
        <Button
          onClick={handleAddScheduled}
          className="bg-primary hover:bg-primary/90 text-white shrink-0 rounded-lg h-11 px-5 shadow-sm"
        >
          <Plus className="h-4 w-4 mr-2" />
          {t('projectScheduling.addScheduled')}
        </Button>
      </div>

      {/* Date groups & project cards */}
      <div className="space-y-8">
        {groupedByDate.map(([date, items]) => (
          <div key={date} className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <Calendar className="h-5 w-5 shrink-0 text-blue-500" aria-hidden />
                <span className="text-base font-semibold text-foreground truncate">{date}</span>
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
              {items.map((schedule) => (
                <motion.div
                  key={schedule.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-xl border border-gray-200/90 bg-white p-4 sm:p-5 shadow-sm"
                >
                  <div className="flex flex-col xl:flex-row xl:items-stretch gap-5 xl:gap-8">
                    {/* Left: project details */}
                    <div className="flex-1 min-w-0 space-y-8">
                      <div>
                        <h2 className="text-base font-semibold text-foreground leading-snug">
                          {schedule.projectTitle}
                        </h2>
                        <p className="text-sm text-muted-foreground mt-0.5">{schedule.category}</p>
                      </div>

                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-4">
                        <div>
                          <span className="text-xs text-muted-foreground block mb-1">
                            {t('projectScheduling.project')}
                          </span>
                          <span className="text-sm font-medium text-foreground">{schedule.project}</span>
                        </div>
                        <div>
                          <span className="text-xs text-muted-foreground block mb-1">
                            {t('projectScheduling.uploadDate')}
                          </span>
                          <span className="text-sm font-medium text-foreground">{schedule.uploadDate}</span>
                        </div>
                        <div>
                          <span className="text-xs text-muted-foreground block mb-1">
                            {t('projectScheduling.client')}
                          </span>
                          <span className="text-sm font-medium text-foreground">{schedule.uploadedBy}</span>
                        </div>
                        <div className="col-span-2 lg:col-span-1">
                          <span className="text-xs text-muted-foreground block mb-1">
                            {t('projectScheduling.serviceLocation')}
                          </span>
                          <span className="text-sm font-medium text-foreground leading-snug">
                            {schedule.serviceLocation || '—'}
                          </span>
                        </div>



                      </div>



                    </div>
                    {/* middle section: assigned employees */}
                    <div className="rounded-xl bg-[#F1F1F1] border border-gray-200/80 p-3.5  flex flex-col min-h-[120px] w-72">
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="text-[10px] font-bold tracking-wide text-muted-foreground uppercase">
                          {t('projectScheduling.assignedEmployees')}
                        </span>
                        <span
                          className={cn(
                            'text-[10px] font-bold px-2 py-0.5 rounded-full',
                            'bg-primary/15 text-primary'
                          )}
                        >
                          {teamBadgeLabel(schedule.team)}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        {schedule.assignedAvatarUrls.map((url, i) => (
                          <Avatar key={`${schedule.id}-av-${i}`} className="h-9 w-9 border-2 border-white shadow-sm">
                            <AvatarImage src={url} alt="" />
                            <AvatarFallback className="text-xs">
                              {schedule.uploadedBy.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        ))}
                        <button
                          type="button"
                          className={cn(
                            'h-9 w-9 rounded-full border-2 border-dashed border-muted-foreground/35',
                            'flex items-center justify-center text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors'
                          )}
                          aria-label={t('projectScheduling.addCrewMember')}
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="mt-auto pt-2">
                        <div className="flex items-center justify-between gap-2 rounded-lg bg-white border border-gray-100 px-3 py-2 shadow-sm">
                          <div className="flex items-center gap-2 min-w-0">
                            <CalendarClock className="h-4 w-4 shrink-0 text-primary" aria-hidden />
                            <span className="text-xs font-medium text-foreground truncate">
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
                      </div>
                    </div>
                    {/* Right: actions — pinned to bottom of card on wide screens */}
                    <div className="flex flex-col w-full xl:w-[min(100%,280px)] shrink-0 xl:self-stretch">
                      <div className="mt-auto flex flex-wrap justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-9 rounded-lg border-gray-200 text-foreground hover:bg-muted/50"
                          onClick={() => handleViewDetails(schedule)}
                        >
                          {t('projectScheduling.viewDetails')}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-9 rounded-lg border-gray-200 text-foreground hover:bg-muted/50"
                          onClick={() => handleReschedule(schedule)}
                        >
                          {t('projectScheduling.reschedule')}
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ))}

        {groupedByDate.length === 0 && (
          <div className="py-16 text-center text-muted-foreground text-sm rounded-xl border border-dashed bg-white/50">
            {t('projectScheduling.noScheduledProjects')}
          </div>
        )}
      </div>

      <ViewScheduleDetailsModal
        open={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false)
          setSelectedSchedule(null)
        }}
        schedule={selectedSchedule}
      />

      <AddEditScheduleModal
        open={isAddEditModalOpen}
        onClose={() => {
          setIsAddEditModalOpen(false)
          setEditSchedule(null)
        }}
        schedule={editSchedule}
        onSave={handleSaveSchedule}
      />
    </motion.div>
  )
}
