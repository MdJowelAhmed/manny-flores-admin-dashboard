import { useState, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ModalWrapper } from '@/components/common'
import { FormInput, DatePicker } from '@/components/common/Form'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  useGetCategoriesQuery,
  mapCategoryFromApi,
} from '@/redux/api/categoryApi'
import type { EquipmentListItem } from '../equipmentMaintenanceData'
import { parseISO } from 'date-fns'
import { toast } from '@/utils/toast'

export interface EquipmentFormSavePayload {
  id?: string
  equipmentName: string
  categoryId: string
  purchaseDate: string
  purchaseCost: number
  warrantyExpiryDate: string
}

interface AddEditEquipmentModalProps {
  open: boolean
  onClose: () => void
  equipment: EquipmentListItem | null
  onSave: (data: EquipmentFormSavePayload) => void | Promise<void>
  isSaving?: boolean
}

export function AddEditEquipmentModal({
  open,
  onClose,
  equipment,
  onSave,
  isSaving = false,
}: AddEditEquipmentModalProps) {
  const { t } = useTranslation()
  const isEdit = !!equipment?.id

  const { data: categoriesResponse } = useGetCategoriesQuery(
    { type: 'EQUIPMENT' },
    { skip: !open }
  )

  const equipmentCategories = useMemo(
    () => (categoriesResponse?.data ?? []).map(mapCategoryFromApi),
    [categoriesResponse]
  )

  const [equipmentName, setEquipmentName] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [purchaseDate, setPurchaseDate] = useState<Date | undefined>(undefined)
  const [purchaseCost, setPurchaseCost] = useState('')
  const [warrantyExpiry, setWarrantyExpiry] = useState<Date | undefined>(undefined)

  useEffect(() => {
    if (!open) return
    const firstId = equipmentCategories[0]?.id ?? ''

    if (equipment) {
      setEquipmentName(equipment.equipmentName)
      setCategoryId(equipment.categoryId || firstId)
      setPurchaseDate(
        equipment.purchaseDate ? parseISO(equipment.purchaseDate) : undefined
      )
      setPurchaseCost(String(equipment.purchaseCost))
      setWarrantyExpiry(
        equipment.warrantyExpiryDate ? parseISO(equipment.warrantyExpiryDate) : undefined
      )
    } else {
      setEquipmentName('')
      setCategoryId(firstId)
      setPurchaseDate(undefined)
      setPurchaseCost('')
      setWarrantyExpiry(undefined)
    }
  }, [equipment, open, equipmentCategories])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!equipmentName.trim()) {
      toast({
        title: t('common.error'),
        description: t('equipmentMaintenance.nameRequired'),
        variant: 'destructive',
      })
      return
    }
    if (!equipmentCategories.length) {
      toast({
        title: t('common.error'),
        description: t('equipmentMaintenance.addCategoryFirst'),
        variant: 'destructive',
      })
      return
    }
    if (!categoryId.trim()) {
      toast({
        title: t('common.error'),
        description: t('equipmentMaintenance.categoryRequired'),
        variant: 'destructive',
      })
      return
    }
    if (!purchaseDate) {
      toast({
        title: t('common.error'),
        description: t('equipmentMaintenance.purchaseDateRequired'),
        variant: 'destructive',
      })
      return
    }
    if (!warrantyExpiry) {
      toast({
        title: t('common.error'),
        description: t('equipmentMaintenance.warrantyRequired'),
        variant: 'destructive',
      })
      return
    }

    const cost = parseFloat(purchaseCost.replace(/[^0-9.-]/g, '')) || 0

    await onSave({
      id: equipment?.id,
      equipmentName: equipmentName.trim(),
      categoryId,
      purchaseDate: purchaseDate.toISOString(),
      purchaseCost: cost,
      warrantyExpiryDate: warrantyExpiry.toISOString(),
    })
  }

  return (
    <ModalWrapper
      open={open}
      onClose={onClose}
      title={isEdit ? t('equipmentMaintenance.editEquipment') : t('equipmentMaintenance.addEquipment')}
      size="lg"
      className="max-w-3xl bg-white max-h-[90vh] overflow-y-auto rounded-xl"
      footer={
        <div className="flex justify-end">
          <Button
            type="submit"
            form="equipment-form"
            className="min-w-[100px] bg-primary hover:bg-primary/90 text-white font-semibold"
            disabled={isSaving}
            isLoading={isSaving}
          >
            {isEdit ? t('common.save') : t('equipmentMaintenance.addEquipment')}
          </Button>
        </div>
      }
    >
      <form id="equipment-form" onSubmit={handleSubmit} className="space-y-5">
        <div>
          <h3 className="text-sm font-bold text-foreground mb-3">
            {t('equipmentMaintenance.basicInformation')}
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <FormInput
              label={t('equipmentMaintenance.equipmentName')}
              placeholder="Enter equipment name"
              value={equipmentName}
              onChange={(e) => setEquipmentName(e.target.value)}
              required
              className="border-gray-200 col-span-2"
            />
            <div className="space-y-2 col-span-2 sm:col-span-1">
              <Label>{t('equipmentMaintenance.category')}</Label>
              <Select
                value={categoryId || undefined}
                onValueChange={setCategoryId}
                disabled={equipmentCategories.length === 0}
              >
                <SelectTrigger className="h-11 rounded-md border-gray-200 bg-background">
                  <SelectValue
                    placeholder={
                      equipmentCategories.length === 0
                        ? t('equipmentMaintenance.noCategories')
                        : t('equipmentMaintenance.selectCategory')
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {equipmentCategories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DatePicker
              label={t('equipmentMaintenance.purchaseDate')}
              value={purchaseDate}
              onChange={setPurchaseDate}
              className="border-gray-200"
            />
            <FormInput
              label={t('equipmentMaintenance.purchaseCost')}
              placeholder="Enter purchase cost"
              value={purchaseCost}
              onChange={(e) => setPurchaseCost(e.target.value)}
              type="number"
              min={0}
              step="0.01"
              className="border-gray-200"
            />
            <DatePicker
              label={t('equipmentMaintenance.warrantyExpiry')}
              value={warrantyExpiry}
              onChange={setWarrantyExpiry}
              className="border-gray-200 col-span-2"
            />
          </div>
        </div>

      </form>
    </ModalWrapper>
  )
}
