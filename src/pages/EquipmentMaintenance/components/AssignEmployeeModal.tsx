import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { ModalWrapper } from '@/components/common'
import { FormInput, DatePicker } from '@/components/common/Form'
import { Button } from '@/components/ui/button'
import type { Equipment, EquipmentAssignedEmployee } from '@/types'
import { parseFlexibleDate, formatDateDisplay } from '@/utils/formatters'
import { toast } from '@/utils/toast'

export interface AssignEmployeePayload {
  equipmentId: string
  assignedEmployee: EquipmentAssignedEmployee
  assignedTo: string
  lastService: string
  nextService: string
}

interface AssignEmployeeModalProps {
  open: boolean
  onClose: () => void
  equipment: Equipment | null
  onSave: (data: AssignEmployeePayload) => void
}

export function AssignEmployeeModal({
  open,
  onClose,
  equipment,
  onSave,
}: AssignEmployeeModalProps) {
  const { t } = useTranslation()

  const [empName, setEmpName] = useState('')
  const [empProject, setEmpProject] = useState('')
  const [empStartDate, setEmpStartDate] = useState<Date | undefined>(undefined)
  const [empLocation, setEmpLocation] = useState('')
  const [lastService, setLastService] = useState<Date | undefined>(undefined)
  const [nextService, setNextService] = useState<Date | undefined>(undefined)

  useEffect(() => {
    if (!open || !equipment) return
    const emp = equipment.assignedEmployee
    setEmpName(emp?.name ?? (equipment.assignedTo !== '—' ? equipment.assignedTo : ''))
    setEmpProject(emp?.project ?? '')
    setEmpStartDate(parseFlexibleDate(emp?.startDate ?? '') ?? undefined)
    setEmpLocation(emp?.location ?? '')
    setLastService(parseFlexibleDate(equipment.lastService) ?? undefined)
    setNextService(parseFlexibleDate(equipment.nextService) ?? undefined)
  }, [equipment, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!equipment) return
    if (!empName.trim()) {
      toast({
        title: t('common.error'),
        description: t('equipmentMaintenance.employeeNameRequired'),
        variant: 'destructive',
      })
      return
    }

    onSave({
      equipmentId: equipment.id,
      assignedTo: empName.trim(),
      assignedEmployee: {
        name: empName.trim(),
        project: empProject.trim(),
        startDate: empStartDate ? formatDateDisplay(empStartDate) : '',
        location: empLocation.trim(),
      },
      lastService: lastService ? formatDateDisplay(lastService) : '',
      nextService: nextService ? formatDateDisplay(nextService) : '',
    })

    toast({
      title: t('common.success'),
      description: t('equipmentMaintenance.employeeAssigned'),
      variant: 'success',
    })
    onClose()
  }

  if (!equipment) return null

  return (
    <ModalWrapper
      open={open}
      onClose={onClose}
      title={t('equipmentMaintenance.assignEmployee')}
      size="lg"
      className="max-w-3xl bg-white max-h-[90vh] overflow-y-auto rounded-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <p className="text-sm text-muted-foreground -mt-2">{equipment.equipmentName}</p>

        <div>
          <h3 className="text-sm font-bold text-foreground mb-3">
            {t('equipmentMaintenance.assignedEmployee')}
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <FormInput
              label={t('common.name')}
              placeholder="Employee name"
              value={empName}
              onChange={(e) => setEmpName(e.target.value)}
              required
              className="border-gray-200"
            />
            <FormInput
              label={t('equipmentMaintenance.project')}
              placeholder="Project name"
              value={empProject}
              onChange={(e) => setEmpProject(e.target.value)}
              className="border-gray-200"
            />
            <DatePicker
              label={t('equipmentMaintenance.startDate')}
              value={empStartDate}
              onChange={setEmpStartDate}
              className="border-gray-200"
            />
            <FormInput
              label={t('equipmentMaintenance.location')}
              placeholder="e.g. Site B"
              value={empLocation}
              onChange={(e) => setEmpLocation(e.target.value)}
              className="border-gray-200"
            />
          </div>
        </div>

        <div>
          <h3 className="text-sm font-bold text-foreground mb-3">
            {t('equipmentMaintenance.maintenance')}
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <DatePicker
              label={t('equipmentMaintenance.lastService')}
              value={lastService}
              onChange={setLastService}
              className="border-gray-200"
            />
            <DatePicker
              label={t('equipmentMaintenance.nextService')}
              value={nextService}
              onChange={setNextService}
              className="border-gray-200"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-gray-200">
          <Button
            type="submit"
            className="w-full bg-primary hover:bg-primary/90 text-white py-2.5 rounded-lg font-medium"
          >
            {t('equipmentMaintenance.saveAssignment')}
          </Button>
        </div>
      </form>
    </ModalWrapper>
  )
}
