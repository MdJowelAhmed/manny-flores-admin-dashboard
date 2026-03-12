import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Calendar, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ViewScheduleDetailsModal } from './components/ViewScheduleDetailsModal'
import { AddEditScheduleModal } from './components/AddEditScheduleModal'
import { mockScheduledProjects, type ScheduledProject } from './projectSchedulingData'
import { cn } from '@/utils/cn'

export default function ProjectScheduling() {
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
              uploadDate: newDate || s.uploadDate,
              scheduledDate: newDate || s.scheduledDate,
              uploadedBy: data.uploadedBy ?? s.uploadedBy,
              email: data.email ?? s.email,
              company: data.company ?? s.company,
              team: data.team ?? s.team,
            }
            : s
        )
      )
    } else {
      const sd = data.uploadDate ?? new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      const newSchedule: ScheduledProject = {
        id: `sch-${Date.now()}`,
        scheduledDate: sd,
        projectTitle: data.projectTitle ?? '',
        category: 'General',
        project: data.projectTitle ?? '',
        uploadDate: data.uploadDate ?? '',
        uploadedBy: data.uploadedBy ?? '',
        team: data.team ?? '',
        customer: data.uploadedBy ?? '',
        email: data.email ?? '',
        company: data.company ?? '',
      }
      setSchedules((prev) => [newSchedule, ...prev])
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-foreground">Project Scheduling</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Schedule projects and manage crew availability
          </p>
        </div>
        <Button
          onClick={handleAddScheduled}
          className="bg-primary hover:bg-primary/90 text-white shrink-0"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Scheduled
        </Button>
      </div>

      {/* Date groups & project list */}
      <div className="space-y-6">
        {groupedByDate.map(([date, items]) => (
          <div key={date} className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-base font-medium text-foreground">{date}</span>
              </div>
              <span className="text-sm text-primary font-medium">
                {items.length} Project{items.length !== 1 ? 's' : ''}
              </span>
            </div>

            <div className="space-y-5">
              {items.map((schedule) => (
                <motion.div
                  key={schedule.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-white border border-gray-100"
                >
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-accent text-base">{schedule.projectTitle}</h4>
                    <p className="text-sm text-muted-foreground mt-0.5">{schedule.category}</p>
                    <div className="flex flex-wrap gap-x-6 gap-y-1 mt-6">
                      <div>
                        <span className="text-xs text-muted-foreground block mb-1">Project</span>
                        <span className="text-sm font-medium">{schedule.project}</span>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground block mb-1">Upload Date</span>
                        <span className="text-sm font-medium">{schedule.uploadDate}</span>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground block mb-1">Uploaded By</span>
                        <span className="text-sm font-medium">{schedule.uploadedBy}</span>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground block mb-1">Team</span>
                        <span className="text-sm font-medium">{schedule.team}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-9"
                      onClick={() => handleViewDetails(schedule)}
                    >
                      View details
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-9"
                      onClick={() => handleReschedule(schedule)}
                    >
                      Reschedule
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ))}

        {groupedByDate.length === 0 && (
          <div className="py-12 text-center text-muted-foreground text-sm">
            No scheduled projects. Click Add Scheduled to create one.
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
