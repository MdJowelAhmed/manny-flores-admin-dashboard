import { useState, useEffect, useMemo } from 'react'
import { ModalWrapper } from '@/components/common'
import { FormInput, DatePicker } from '@/components/common/Form'
import { Button } from '@/components/ui/button'
import type { Equipment } from '@/types'
import { toast } from '@/utils/toast'
import { parseFlexibleDate, formatDateDisplay } from '@/utils/formatters'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAppSelector } from '@/redux/hooks'

interface AddEditEquipmentModalProps {
  open: boolean
  onClose: () => void
  equipment: Equipment | null
  onSave: (data: Partial<Equipment>) => void
}

export function AddEditEquipmentModal({
  open,
  onClose,
  equipment,
  onSave,
}: AddEditEquipmentModalProps) {
  const isEdit = !!equipment

  const equipmentCategories = useAppSelector((s) => s.equipmentCategories.list)

  const [model, setModel] = useState('')
  const [category, setCategory] = useState('')
  const [purchaseDate, setPurchaseDate] = useState<Date | undefined>(undefined)
  const [purchaseCost, setPurchaseCost] = useState('')
  const [warrantyExpiry, setWarrantyExpiry] = useState<Date | undefined>(undefined)
  const [empName, setEmpName] = useState('')
  const [empProject, setEmpProject] = useState('')
  const [empStartDate, setEmpStartDate] = useState<Date | undefined>(undefined)
  const [empLocation, setEmpLocation] = useState('')
  const [lastService, setLastService] = useState<Date | undefined>(undefined)
  const [nextService, setNextService] = useState<Date | undefined>(undefined)

  const categoryOptions = useMemo(() => {
    const names = equipmentCategories.map((c) => c.name)
    const set = new Set<string>(names)
    if (equipment?.category) set.add(equipment.category)
    return Array.from(set)
  }, [equipment?.category, equipmentCategories])

  useEffect(() => {
    if (open) {
      const names = equipmentCategories.map((c) => c.name)
      const opts = Array.from(new Set([...names, ...(equipment?.category ? [equipment.category] : [])]))
      const first = opts[0] ?? ''

      if (equipment) {
        setModel(equipment.model)
        setCategory(equipment.category && opts.includes(equipment.category) ? equipment.category : first)
        setPurchaseDate(parseFlexibleDate(equipment.purchaseDate) ?? undefined)
        setPurchaseCost(equipment.purchaseCost)
        setWarrantyExpiry(parseFlexibleDate(equipment.warrantyExpiry) ?? undefined)
        const emp = equipment.assignedEmployee
        setEmpName(emp?.name ?? '')
        setEmpProject(emp?.project ?? '')
        setEmpStartDate(parseFlexibleDate(emp?.startDate ?? '') ?? undefined)
        setEmpLocation(emp?.location ?? '')
        setLastService(parseFlexibleDate(equipment.lastService) ?? undefined)
        setNextService(parseFlexibleDate(equipment.nextService) ?? undefined)
      } else {
        setModel('')
        setCategory(first)
        setPurchaseDate(undefined)
        setPurchaseCost('')
        setWarrantyExpiry(undefined)
        setEmpName('')
        setEmpProject('')
        setEmpStartDate(undefined)
        setEmpLocation('')
        setLastService(undefined)
        setNextService(undefined)
      }
    }
  }, [equipment, open, equipmentCategories])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const payload: Partial<Equipment> = {
      model: model.trim(),
      category,
      purchaseDate: purchaseDate ? formatDateDisplay(purchaseDate) : '',
      purchaseCost: purchaseCost.trim(),
      warrantyExpiry: warrantyExpiry ? formatDateDisplay(warrantyExpiry) : '',
      assignedEmployee: {
        name: empName.trim(),
        project: empProject.trim(),
        startDate: empStartDate ? formatDateDisplay(empStartDate) : '',
        location: empLocation.trim(),
      },
      lastService: lastService ? formatDateDisplay(lastService) : '',
      nextService: nextService ? formatDateDisplay(nextService) : '',
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
      className="max-w-3xl bg-white max-h-[90vh] overflow-y-auto rounded-xl"
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
            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                value={category || undefined}
                onValueChange={setCategory}
                disabled={categoryOptions.length === 0}
              >
                <SelectTrigger className="h-11 rounded-md border-gray-200 bg-background">
                  <SelectValue
                    placeholder={categoryOptions.length === 0 ? 'No categories' : 'Select category'}
                  />
                </SelectTrigger>
                <SelectContent>
                  {categoryOptions.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DatePicker
              label="Purchase Date"
              value={purchaseDate}
              onChange={setPurchaseDate}
              className="border-gray-200"
            />
            <FormInput
              label="Purchase Cost"
              placeholder="e.g. $587,874.000"
              value={purchaseCost}
              onChange={(e) => setPurchaseCost(e.target.value)}
              className="border-gray-200"
            />
            <DatePicker
              label="Warranty Expiry"
              value={warrantyExpiry}
              onChange={setWarrantyExpiry}
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
            <DatePicker
              label="Start date"
              value={empStartDate}
              onChange={setEmpStartDate}
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
            <DatePicker
              label="Last Service"
              value={lastService}
              onChange={setLastService}
              className="border-gray-200"
            />
            <DatePicker
              label="Next Service"
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
            {isEdit ? 'Update' : 'Add Equipment'}
          </Button>
        </div>
      </form>
    </ModalWrapper>
  )
}
