import { useState, useEffect } from 'react'
import { parse, format } from 'date-fns'
import { ModalWrapper } from '@/components/common'
import { FormInput, FormSelect } from '@/components/common/Form'
import { Button } from '@/components/ui/button'
import type { Equipment } from '@/types'
import { equipmentCategoryOptions } from '../equipmentMaintenanceData'
import { toast } from '@/utils/toast'

interface AddEditEquipmentModalProps {
  open: boolean
  onClose: () => void
  equipment: Equipment | null
  onSave: (data: Partial<Equipment>) => void
}

function parseDateToInput(dateStr: string): string {
  if (!dateStr) return ''
  try {
    const d = parse(dateStr.replace(/\s*,/g, ','), 'MMM dd, yyyy', new Date())
    return format(d, 'yyyy-MM-dd')
  } catch {
    try {
      const d = new Date(dateStr)
      if (!isNaN(d.getTime())) return format(d, 'yyyy-MM-dd')
    } catch {
      //
    }
    return dateStr
  }
}

function formatInputToDisplay(val: string): string {
  if (!val) return ''
  try {
    const d = parse(val, 'yyyy-MM-dd', new Date())
    return format(d, 'MMM dd, yyyy')
  } catch {
    return val
  }
}

export function AddEditEquipmentModal({
  open,
  onClose,
  equipment,
  onSave,
}: AddEditEquipmentModalProps) {
  const isEdit = !!equipment

  const [model, setModel] = useState('')
  const [category, setCategory] = useState('')
  const [purchaseDate, setPurchaseDate] = useState('')
  const [purchaseCost, setPurchaseCost] = useState('')
  const [warrantyExpiry, setWarrantyExpiry] = useState('')
  const [empName, setEmpName] = useState('')
  const [empProject, setEmpProject] = useState('')
  const [empStartDate, setEmpStartDate] = useState('')
  const [empLocation, setEmpLocation] = useState('')
  const [lastService, setLastService] = useState('')
  const [nextService, setNextService] = useState('')

  useEffect(() => {
    if (open) {
      if (equipment) {
        setModel(equipment.model)
        setCategory(equipment.category)
        setPurchaseDate(parseDateToInput(equipment.purchaseDate))
        setPurchaseCost(equipment.purchaseCost)
        setWarrantyExpiry(parseDateToInput(equipment.warrantyExpiry))
        const emp = equipment.assignedEmployee
        setEmpName(emp?.name ?? '')
        setEmpProject(emp?.project ?? '')
        setEmpStartDate(parseDateToInput(emp?.startDate ?? ''))
        setEmpLocation(emp?.location ?? '')
        setLastService(parseDateToInput(equipment.lastService))
        setNextService(parseDateToInput(equipment.nextService))
      } else {
        setModel('')
        setCategory('')
        setPurchaseDate('')
        setPurchaseCost('')
        setWarrantyExpiry('')
        setEmpName('')
        setEmpProject('')
        setEmpStartDate('')
        setEmpLocation('')
        setLastService('')
        setNextService('')
      }
    }
  }, [equipment, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const payload: Partial<Equipment> = {
      model: model.trim(),
      category,
      purchaseDate: purchaseDate ? formatInputToDisplay(purchaseDate) : '',
      purchaseCost: purchaseCost.trim(),
      warrantyExpiry: warrantyExpiry ? formatInputToDisplay(warrantyExpiry) : '',
      assignedEmployee: {
        name: empName.trim(),
        project: empProject.trim(),
        startDate: empStartDate ? formatInputToDisplay(empStartDate) : '',
        location: empLocation.trim(),
      },
      lastService: lastService ? formatInputToDisplay(lastService) : '',
      nextService: nextService ? formatInputToDisplay(nextService) : '',
    }
    if (isEdit && equipment) {
      payload.equipmentName = equipment.equipmentName
      payload.type = category || equipment.type
      payload.assignedTo = empName.trim() || equipment.assignedTo
    } else {
      const id = `eq-${Date.now()}`
      payload.equipmentName = model.trim() || 'Equipment'
      payload.type = category
      payload.assignedTo = empName.trim()
      payload.usage = '0 hrs'
      payload.status = 'Available'
      payload.id = id
    }
    onSave(payload)
    toast({
      title: 'Success',
      description: isEdit ? 'Equipment updated successfully.' : 'Equipment added successfully.',
      variant: 'success',
    })
    onClose()
  }

  return (
    <ModalWrapper
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit Equipment Details' : 'Add Equipment'}
      size="lg"
      className="max-w-xl bg-white max-h-[90vh] overflow-y-auto rounded-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <h3 className="text-sm font-bold text-foreground mb-3">Basic Information</h3>
          <div className="grid grid-cols-2 gap-4">
            <FormInput
              label="Model"
              placeholder="e.g. Hitachi ZX200"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              required
              className="border-gray-200"
            />
            <FormSelect
              label="Category"
              value={category}
              options={equipmentCategoryOptions}
              onChange={setCategory}
              placeholder="Select category"
              className="border-gray-200"
            />
            <FormInput
              label="Purchase Date"
              type="date"
              value={purchaseDate}
              onChange={(e) => setPurchaseDate(e.target.value)}
              className="border-gray-200"
            />
            <FormInput
              label="Purchase Cost"
              placeholder="e.g. $587,874.000"
              value={purchaseCost}
              onChange={(e) => setPurchaseCost(e.target.value)}
              className="border-gray-200"
            />
            <FormInput
              label="Warranty Expiry"
              type="date"
              value={warrantyExpiry}
              onChange={(e) => setWarrantyExpiry(e.target.value)}
              className="border-gray-200 col-span-2"
            />
          </div>
        </div>

        <div>
          <h3 className="text-sm font-bold text-foreground mb-3">Assigned Employee</h3>
          <div className="grid grid-cols-2 gap-4">
            <FormInput
              label="Name"
              placeholder="Employee name"
              value={empName}
              onChange={(e) => setEmpName(e.target.value)}
              className="border-gray-200"
            />
            <FormInput
              label="Project"
              placeholder="Project name"
              value={empProject}
              onChange={(e) => setEmpProject(e.target.value)}
              className="border-gray-200"
            />
            <FormInput
              label="Start date"
              type="date"
              value={empStartDate}
              onChange={(e) => setEmpStartDate(e.target.value)}
              className="border-gray-200"
            />
            <FormInput
              label="Location"
              placeholder="e.g. Site B - North Perimeter"
              value={empLocation}
              onChange={(e) => setEmpLocation(e.target.value)}
              className="border-gray-200"
            />
          </div>
        </div>

        <div>
          <h3 className="text-sm font-bold text-foreground mb-3">Maintenance</h3>
          <div className="grid grid-cols-2 gap-4">
            <FormInput
              label="Last Service"
              type="date"
              value={lastService}
              onChange={(e) => setLastService(e.target.value)}
              className="border-gray-200"
            />
            <FormInput
              label="Next Service"
              type="date"
              value={nextService}
              onChange={(e) => setNextService(e.target.value)}
              className="border-gray-200"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-gray-200">
          <Button
            type="submit"
            className="w-full bg-primary hover:bg-primary/90 text-white py-2.5 rounded-lg font-medium"
          >
            {isEdit ? 'Update' : 'Add Equipment'}
          </Button>
        </div>
      </form>
    </ModalWrapper>
  )
}
