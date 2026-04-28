import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { ModalWrapper } from '@/components/common'
import { FormInput, DatePicker, FormSelect } from '@/components/common/Form'
import { Button } from '@/components/ui/button'
import type { ScheduledProject } from '../projectSchedulingData'
import { toast } from '@/utils/toast'
import { parseFlexibleDate, formatDateDisplay } from '@/utils/formatters'
import { cn } from '@/utils/cn'
import type { SelectOption } from '@/types'

interface AddEditScheduleModalProps {
  open: boolean
  onClose: () => void
  schedule: ScheduledProject | null
  onSave: (data: Partial<ScheduledProject>) => void
  teamOptions?: SelectOption[]
}

const inputClass =
  'rounded-lg bg-muted/50 border-gray-200/80 focus-visible:ring-primary/30 h-11'

export function AddEditScheduleModal({
  open,
  onClose,
  schedule,
  onSave,
  teamOptions = [],
}: AddEditScheduleModalProps) {
  const { t } = useTranslation()
  const isEdit = !!schedule?.id

  const [projectName, setProjectName] = useState('')
  const [uploadDate, setUploadDate] = useState<Date | undefined>(undefined)
  const [uploadedBy, setUploadedBy] = useState('')
  const [email, setEmail] = useState('')
  const [company, setCompany] = useState('')
  const [team, setTeam] = useState('')

  useEffect(() => {
    if (schedule) {
      setProjectName(schedule.projectTitle)
      setUploadDate(parseFlexibleDate(schedule.uploadDate) ?? undefined)
      setUploadedBy(schedule.uploadedBy)
      setEmail(schedule.email)
      setCompany(schedule.company)
      setTeam(schedule.team)
    } else {
      setProjectName('')
      setUploadDate(undefined)
      setUploadedBy('')
      setEmail('')
      setCompany('')
      setTeam('')
    }
  }, [schedule, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      id: schedule?.id,
      projectTitle: projectName.trim(),
      uploadDate: uploadDate ? formatDateDisplay(uploadDate) : '',
      uploadedBy: uploadedBy.trim(),
      email: email.trim(),
      company: company.trim(),
      team: team.trim(),
    })
    toast({
      title: t('common.success'),
      description: isEdit
        ? t('projectScheduling.scheduleUpdated')
        : t('projectScheduling.scheduleAdded'),
      variant: 'success',
    })
    onClose()
  }

  return (
    <ModalWrapper
      open={open}
      onClose={onClose}
      title={isEdit ? t('projectScheduling.editSchedule') : t('projectScheduling.addNewSchedule')}
      size="lg"
      className="max-w-xl bg-white sm:rounded-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-4">
            {t('projectScheduling.basicInformation')}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-4">
            <FormInput
              label={t('projectScheduling.projectName')}
              placeholder={t('projectScheduling.placeholderProjectName')}
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              required
              className={cn(inputClass)}
            />
            <DatePicker
              label={t('projectScheduling.uploadDate')}
              value={uploadDate}
              onChange={setUploadDate}
              className="[&_button]:rounded-lg [&_button]:bg-muted/50 [&_button]:border-gray-200/80 [&_button]:h-11 [&_button]:font-normal"
            />
            <FormInput
              label={t('projectScheduling.uploadBy')}
              placeholder={t('projectScheduling.placeholderUploadBy')}
              value={uploadedBy}
              onChange={(e) => setUploadedBy(e.target.value)}
              className={cn(inputClass)}
            />
            <FormInput
              label={t('projectScheduling.email')}
              placeholder={t('projectScheduling.placeholderEmail')}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={cn(inputClass)}
            />
            <FormInput
              label={t('projectScheduling.company')}
              placeholder={t('projectScheduling.placeholderCompany')}
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className={cn(inputClass)}
            />
            <FormSelect
              label={t('projectScheduling.team')}
              value={team}
              options={teamOptions}
              onChange={setTeam}
              placeholder={t('projectScheduling.placeholderTeam')}
              className="md:col-span-2"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="rounded-lg border-gray-200 min-w-[100px]"
          >
            {t('common.cancel')}
          </Button>
          <Button type="submit" className="bg-primary hover:bg-primary/90 text-white rounded-lg min-w-[100px]">
            {t('common.save')}
          </Button>
        </div>
      </form>
    </ModalWrapper>
  )
}
