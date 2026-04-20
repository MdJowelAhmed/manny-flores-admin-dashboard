import { useState, useEffect, useMemo } from 'react'
import { ModalWrapper } from '@/components/common'
import { FormInput, FormSelect, DatePicker } from '@/components/common/Form'
import { Button } from '@/components/ui/button'
import type { Vehicle } from '@/types'
import { vehicleTypeOptions } from '../vehicleMaintenanceData'
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

interface AddEditVehicleModalProps {
  open: boolean
  onClose: () => void
  vehicle: Vehicle | null
  onSave: (data: Partial<Vehicle>) => void
}

export function AddEditVehicleModal({
  open,
  onClose,
  vehicle,
  onSave,
}: AddEditVehicleModalProps) {
  const isEdit = !!vehicle

  const vehicleCategories = useAppSelector((s) => s.vehicleCategories.list)

  const [model, setModel] = useState('')
  const [year, setYear] = useState('')
  const [category, setCategory] = useState<string>('')
  const [type, setType] = useState('')
  const [purchaseDate, setPurchaseDate] = useState<Date | undefined>(undefined)
  const [purchaseCost, setPurchaseCost] = useState('')
  const [insuranceExpiry, setInsuranceExpiry] = useState<Date | undefined>(undefined)
  const [empName, setEmpName] = useState('')
  const [empProject, setEmpProject] = useState('')
  const [empStartDate, setEmpStartDate] = useState<Date | undefined>(undefined)
  const [empLocation, setEmpLocation] = useState('')
  const [lastService, setLastService] = useState<Date | undefined>(undefined)
  const [nextService, setNextService] = useState<Date | undefined>(undefined)

  const categoryOptions = useMemo(() => {
    const names = vehicleCategories.map((c) => c.name)
    const set = new Set<string>(names)
    if (vehicle?.category) set.add(vehicle.category)
    return Array.from(set)
  }, [vehicle?.category, vehicleCategories])

  useEffect(() => {
    if (open) {
      const names = vehicleCategories.map((c) => c.name)
      const opts = Array.from(new Set([...names, ...(vehicle?.category ? [vehicle.category] : [])]))
      const first = opts[0] ?? ''

      if (vehicle) {
        setModel(vehicle.model)
        setYear(vehicle.year)
        setCategory(vehicle.category && opts.includes(vehicle.category) ? vehicle.category : first)
        setType(vehicle.type)
        setPurchaseDate(parseFlexibleDate(vehicle.purchaseDate) ?? undefined)
        setPurchaseCost(vehicle.purchaseCost)
        setInsuranceExpiry(parseFlexibleDate(vehicle.insuranceExpiry) ?? undefined)
        const emp = vehicle.assignedEmployee
        setEmpName(emp?.name ?? '')
        setEmpProject(emp?.project ?? '')
        setEmpStartDate(parseFlexibleDate(emp?.startDate ?? '') ?? undefined)
        setEmpLocation(emp?.location ?? '')
        setLastService(parseFlexibleDate(vehicle.lastService) ?? undefined)
        setNextService(parseFlexibleDate(vehicle.nextService) ?? undefined)
      } else {
        setModel('')
        setYear('')
        setCategory(first)
        setType('')
        setPurchaseDate(undefined)
        setPurchaseCost('')
        setInsuranceExpiry(undefined)
        setEmpName('')
        setEmpProject('')
        setEmpStartDate(undefined)
        setEmpLocation('')
        setLastService(undefined)
        setNextService(undefined)
      }
    }
  }, [vehicle, open, vehicleCategories])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const payload: Partial<Vehicle> = {
      model: model.trim(),
      year: year.trim(),
      category,
      type,
      purchaseDate: purchaseDate ? formatDateDisplay(purchaseDate) : '',
      purchaseCost: purchaseCost.trim(),
      insuranceExpiry: insuranceExpiry ? formatDateDisplay(insuranceExpiry) : '',
      assignedEmployee: {
        name: empName.trim(),
        project: empProject.trim(),
        startDate: empStartDate ? formatDateDisplay(empStartDate) : '',
        location: empLocation.trim(),
      },
      lastService: lastService ? formatDateDisplay(lastService) : '',
      nextService: nextService ? formatDateDisplay(nextService) : '',
    }
    if (isEdit && vehicle) {
      payload.vehicleName = `${model} #${vehicle.id.split('-').pop()}`
      payload.assignedTo = empName.trim() || vehicle.assignedTo
    } else {
      const id = `v-${Date.now()}`
      payload.vehicleName = `${model} #${id.split('-').pop()?.slice(-2) ?? '00'}`
      payload.assignedTo = empName.trim()
      payload.usage = '0 km'
      payload.status = 'Available'
      payload.id = id
    }
    onSave(payload)
    toast({
      title: 'Success',
      description: isEdit ? 'Vehicle updated successfully.' : 'Vehicle added successfully.',
      variant: 'success',
    })
    onClose()
  }

  return (
    <ModalWrapper
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit Vehicles Details' : 'Add Vehicles Details'}
      size="lg"
      className="max-w-3xl bg-white max-h-[90vh] overflow-y-auto rounded-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <h3 className="text-sm font-bold text-foreground mb-3">Basic Information</h3>
          <div className="grid grid-cols-2 gap-4">
            <FormInput
              label="Model"
              placeholder="e.g. Ford F-150"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              required
              className="border-gray-200"
            />
            <FormInput
              label="Year"
              placeholder="e.g. 2023"
              value={year}
              onChange={(e) => setYear(e.target.value)}
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
            <FormSelect
              label="Type"
              value={type}
              options={vehicleTypeOptions}
              onChange={setType}
              placeholder="Select type"
              className="border-gray-200"
            />
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
              label="Insurance Expiry"
              value={insuranceExpiry}
              onChange={setInsuranceExpiry}
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
            {/* <FormInput
              label="Project"
              placeholder="Project name"
              value={empProject}
              onChange={(e) => setEmpProject(e.target.value)}
              className="border-gray-200"
            /> */}
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
            {isEdit ? 'Update' : 'Add Vehicle'}
          </Button>
        </div>
      </form>
    </ModalWrapper>
  )
}
