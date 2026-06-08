import { useState, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ModalWrapper } from '@/components/common'
import { FormInput, FormSelect, DatePicker } from '@/components/common/Form'
import { Button } from '@/components/ui/button'
import type { VehicleListItem } from '../vehicleMaintenanceData'
import { vehicleTypeOptions } from '../vehicleMaintenanceData'
import { toast } from '@/utils/toast'
import { parseISO } from 'date-fns'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useGetCategoriesQuery, mapCategoryFromApi } from '@/redux/api/categoryApi'

export interface VehicleFormSavePayload {
  id?: string
  model: string
  year: number
  type: string
  categoryId: string
  purchaseDate: string
  purchaseCost: number
  insuranceExpires: string
  maintenanceLastServiceDate?: string
  maintenanceNextServiceDate?: string
}

interface AddEditVehicleModalProps {
  open: boolean
  onClose: () => void
  vehicle: VehicleListItem | null
  onSave: (data: VehicleFormSavePayload) => void | Promise<void>
  isSaving?: boolean
}

export function AddEditVehicleModal({
  open,
  onClose,
  vehicle,
  onSave,
  isSaving = false,
}: AddEditVehicleModalProps) {
  const { t } = useTranslation()
  const isEdit = !!vehicle

  const { data: categoriesResponse } = useGetCategoriesQuery(
    { type: 'VEHICLE' },
    { skip: !open }
  )

  const vehicleCategories = useMemo(
    () => (categoriesResponse?.data ?? []).map(mapCategoryFromApi),
    [categoriesResponse]
  )

  const [model, setModel] = useState('')
  const [year, setYear] = useState('')
  const [categoryId, setCategoryId] = useState<string>('')
  const [type, setType] = useState('')
  const [purchaseDate, setPurchaseDate] = useState<Date | undefined>(undefined)
  const [purchaseCost, setPurchaseCost] = useState('')
  const [insuranceExpiry, setInsuranceExpiry] = useState<Date | undefined>(undefined)
  const [lastService, setLastService] = useState<Date | undefined>(undefined)
  const [nextService, setNextService] = useState<Date | undefined>(undefined)

  const categoryOptions = useMemo(() => {
    const opts = vehicleCategories.map((c) => ({ id: c.id, name: c.name }))
    if (vehicle?.categoryId && !opts.some((c) => c.id === vehicle.categoryId)) {
      opts.unshift({ id: vehicle.categoryId, name: vehicle.category || vehicle.categoryId })
    }
    return opts
  }, [vehicle?.category, vehicle?.categoryId, vehicleCategories])

  useEffect(() => {
    if (!open) return
    const firstId = categoryOptions[0]?.id ?? ''
    if (vehicle) {
      setModel(vehicle.model)
      setYear(String(vehicle.year))
      setCategoryId(vehicle.categoryId || firstId)
      setType(vehicle.type)
      setPurchaseDate(vehicle.purchaseDate ? parseISO(vehicle.purchaseDate) : undefined)
      setPurchaseCost(String(vehicle.purchaseCost))
      setInsuranceExpiry(
        vehicle.insuranceExpires ? parseISO(vehicle.insuranceExpires) : undefined
      )
      setLastService(
        vehicle.maintenanceLastServiceDate
          ? parseISO(vehicle.maintenanceLastServiceDate)
          : undefined
      )
      setNextService(
        vehicle.maintenanceNextServiceDate
          ? parseISO(vehicle.maintenanceNextServiceDate)
          : undefined
      )
    } else {
      setModel('')
      setYear('')
      setCategoryId(firstId)
      setType('')
      setPurchaseDate(undefined)
      setPurchaseCost('')
      setInsuranceExpiry(undefined)
      setLastService(undefined)
      setNextService(undefined)
    }
  }, [categoryOptions, open, vehicle])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!model.trim()) {
      toast({
        title: t('common.error'),
        description: t('vehicleMaintenance.modelRequired'),
        variant: 'destructive',
      })
      return
    }
    if (!categoryOptions.length) {
      toast({
        title: t('common.error'),
        description: t('vehicleMaintenance.addCategoryFirst'),
        variant: 'destructive',
      })
      return
    }
    if (!categoryId.trim()) {
      toast({
        title: t('common.error'),
        description: t('vehicleMaintenance.categoryRequired'),
        variant: 'destructive',
      })
      return
    }
    if (!purchaseDate) {
      toast({
        title: t('common.error'),
        description: t('vehicleMaintenance.purchaseDateRequired'),
        variant: 'destructive',
      })
      return
    }
    if (!insuranceExpiry) {
      toast({
        title: t('common.error'),
        description: t('vehicleMaintenance.insuranceRequired'),
        variant: 'destructive',
      })
      return
    }

    const parsedYear = parseInt(year, 10)
    const parsedCost = parseFloat(purchaseCost.replace(/[^0-9.-]/g, '')) || 0

    await onSave({
      id: vehicle?.id,
      model: model.trim(),
      year: Number.isFinite(parsedYear) ? parsedYear : new Date().getFullYear(),
      type: type.trim(),
      categoryId,
      purchaseDate: purchaseDate.toISOString(),
      purchaseCost: parsedCost,
      insuranceExpires: insuranceExpiry.toISOString(),
      maintenanceLastServiceDate: lastService?.toISOString(),
      maintenanceNextServiceDate: nextService?.toISOString(),
    })
  }

  return (
    <ModalWrapper
      open={open}
      onClose={onClose}
      title={isEdit ? t('vehicleMaintenance.editVehicle') : t('vehicleMaintenance.addVehicle')}
      size="lg"
      className="max-w-3xl bg-white max-h-[90vh] overflow-y-auto rounded-xl"
      footer={
        <div className="flex justify-end">
          <Button
            type="submit"
            form="vehicle-form"
            className="min-w-[100px] bg-primary hover:bg-primary/90 text-white font-semibold"
            disabled={isSaving}
            isLoading={isSaving}
          >
            {isEdit ? t('common.save') : t('vehicleMaintenance.addVehicle')}
          </Button>
        </div>
      }
    >
      <form id="vehicle-form" onSubmit={handleSubmit} className="space-y-5">
        <div>
          <h3 className="text-sm font-bold text-foreground mb-3">
            {t('vehicleMaintenance.basicInformation')}
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <FormInput
              label={t('vehicleMaintenance.model')}
              placeholder="e.g. Ford F-150"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              required
              className="border-gray-200"
            />
            <FormInput
              label={t('vehicleMaintenance.year')}
              placeholder="e.g. 2023"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              required
              type="number"
              className="border-gray-200"
            />
            <div className="space-y-2">
              <Label>{t('vehicleMaintenance.category')}</Label>
              <Select
                value={categoryId || undefined}
                onValueChange={setCategoryId}
                disabled={categoryOptions.length === 0}
              >
                <SelectTrigger className="h-11 rounded-md border-gray-200 bg-background">
                  <SelectValue
                    placeholder={
                      categoryOptions.length === 0
                        ? t('vehicleMaintenance.noCategories')
                        : t('vehicleMaintenance.selectCategory')
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {categoryOptions.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <FormSelect
              label={t('resourceRequests.type')}
              value={type}
              options={vehicleTypeOptions}
              onChange={setType}
              placeholder="Select type"
              className="border-gray-200"
            />
            <DatePicker
              label={t('vehicleMaintenance.purchaseDate')}
              value={purchaseDate}
              onChange={setPurchaseDate}
              className="border-gray-200"
            />
            <FormInput
              label={t('vehicleMaintenance.purchaseCost')}
              placeholder="Enter purchase cost"
              value={purchaseCost}
              onChange={(e) => setPurchaseCost(e.target.value)}
              type="number"
              min={0}
              step="0.01"
              className="border-gray-200"
            />
            <DatePicker
              label={t('vehicleMaintenance.insuranceExpiry')}
              value={insuranceExpiry}
              onChange={setInsuranceExpiry}
              className="border-gray-200 col-span-2"
            />
          </div>
        </div>

        <div>
          <h3 className="text-sm font-bold text-foreground mb-3">
            {t('vehicleMaintenance.maintenance')}
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <DatePicker
              label={t('vehicleMaintenance.lastService')}
              value={lastService}
              onChange={setLastService}
              className="border-gray-200"
            />
            <DatePicker
              label={t('vehicleMaintenance.nextService')}
              value={nextService}
              onChange={setNextService}
              className="border-gray-200"
            />
          </div>
        </div>
      </form>
    </ModalWrapper>
  )
}
