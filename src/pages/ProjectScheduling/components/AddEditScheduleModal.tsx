import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { ModalWrapper } from '@/components/common'
import { DatePicker } from '@/components/common/Form'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import type { ScheduledProject } from '../projectSchedulingData'
import { toast } from '@/utils/toast'
import { parseFlexibleDate } from '@/utils/formatters'
import { cn } from '@/utils/cn'

export interface RescheduleFormValues {
  note: string
  estimateStartDate: string
  estimateEndDate: string
}

interface AddEditScheduleModalProps {
  open: boolean
  onClose: () => void
  schedule: ScheduledProject | null
  onReschedule: (estimateId: string, values: RescheduleFormValues) => Promise<void>
  isSaving?: boolean
}

function toIsoDate(date: Date): string {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d.toISOString()
}

export function AddEditScheduleModal({
  open,
  onClose,
  schedule,
  onReschedule,
  isSaving = false,
}: AddEditScheduleModalProps) {
  const { t } = useTranslation()

  const [note, setNote] = useState('')
  const [startDate, setStartDate] = useState<Date | undefined>(undefined)
  const [endDate, setEndDate] = useState<Date | undefined>(undefined)

  useEffect(() => {
    if (!schedule) {
      setNote('')
      setStartDate(undefined)
      setEndDate(undefined)
      return
    }
    setNote('')
    setStartDate(
      schedule.estimateStartDate
        ? new Date(schedule.estimateStartDate)
        : parseFlexibleDate(schedule.scheduledDate) ?? undefined
    )
    setEndDate(
      schedule.estimateEndDate
        ? new Date(schedule.estimateEndDate)
        : undefined
    )
  }, [schedule, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!schedule?.estimateId) return
    if (!startDate || !endDate) {
      toast({
        title: t('common.error'),
        description: t('projectScheduling.rescheduleDatesRequired'),
        variant: 'destructive',
      })
      return
    }
    if (endDate < startDate) {
      toast({
        title: t('common.error'),
        description: t('projectScheduling.rescheduleEndBeforeStart'),
        variant: 'destructive',
      })
      return
    }

    try {
      await onReschedule(schedule.estimateId, {
        note: note.trim(),
        estimateStartDate: toIsoDate(startDate),
        estimateEndDate: toIsoDate(endDate),
      })
      toast({
        title: t('common.success'),
        description: t('projectScheduling.scheduleUpdated'),
        variant: 'success',
      })
      onClose()
    } catch {
      toast({
        title: t('common.error'),
        description: t('projectScheduling.rescheduleFailed'),
        variant: 'destructive',
      })
    }
  }

  return (
    <ModalWrapper
      open={open}
      onClose={onClose}
      title={t('projectScheduling.rescheduleProject')}
      size="lg"
      className="max-w-xl bg-white sm:rounded-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {schedule && (
          <p className="text-sm text-muted-foreground -mt-2">{schedule.projectTitle}</p>
        )}

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DatePicker
              label={t('projectScheduling.startDate')}
              value={startDate}
              onChange={setStartDate}
              className="[&_button]:rounded-lg [&_button]:bg-muted/50 [&_button]:border-gray-200/80 [&_button]:h-11 [&_button]:font-normal"
            />
            <DatePicker
              label={t('projectScheduling.endDate')}
              value={endDate}
              onChange={setEndDate}
              className="[&_button]:rounded-lg [&_button]:bg-muted/50 [&_button]:border-gray-200/80 [&_button]:h-11 [&_button]:font-normal"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              {t('projectScheduling.rescheduleNote')}
            </label>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={t('projectScheduling.rescheduleNotePlaceholder')}
              className={cn('min-h-[100px] rounded-lg bg-muted/50 border-gray-200/80')}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSaving}
            className="rounded-lg border-gray-200 min-w-[100px]"
          >
            {t('common.cancel')}
          </Button>
          <Button
            type="submit"
            disabled={isSaving}
            className="bg-primary hover:bg-primary/90 text-white rounded-lg min-w-[100px]"
          >
            {t('common.save')}
          </Button>
        </div>
      </form>
    </ModalWrapper>
  )
}
