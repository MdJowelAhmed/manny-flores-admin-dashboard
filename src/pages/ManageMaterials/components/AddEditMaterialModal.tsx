import { useState, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ModalWrapper } from '@/components/common'
import { FormInput } from '@/components/common/Form'
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
import type { Material } from '../manageMaterialsData'
import { toast } from '@/utils/toast'

export interface MaterialFormSavePayload {
  id?: string
  name: string
  categoryId: string
  unitPrice: number
  quantity: number
}

interface AddEditMaterialModalProps {
  open: boolean
  onClose: () => void
  material: Material | null
  onSave: (data: MaterialFormSavePayload) => void | Promise<void>
  isSaving?: boolean
}

export function AddEditMaterialModal({
  open,
  onClose,
  material,
  onSave,
  isSaving = false,
}: AddEditMaterialModalProps) {
  const { t } = useTranslation()
  const isEdit = !!material?.id

  const { data: categoriesResponse } = useGetCategoriesQuery(
    { type: 'MATERIAL' },
    { skip: !open }
  )

  const materialCategories = useMemo(
    () => (categoriesResponse?.data ?? []).map(mapCategoryFromApi),
    [categoriesResponse]
  )

  const [materialName, setMaterialName] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [unitPrice, setUnitPrice] = useState('')
  const [quantity, setQuantity] = useState('')

  useEffect(() => {
    if (!open) return
    const firstId = materialCategories[0]?.id ?? ''

    if (material) {
      setMaterialName(material.materialName)
      setCategoryId(material.categoryId || firstId)
      setUnitPrice(String(material.unitPrice ?? ''))
      setQuantity(String(material.quantity ?? ''))
    } else {
      setMaterialName('')
      setCategoryId(firstId)
      setUnitPrice('')
      setQuantity('')
    }
  }, [material, open, materialCategories])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!materialName.trim()) {
      toast({
        title: t('common.error'),
        description: t('manageMaterials.nameRequired'),
        variant: 'destructive',
      })
      return
    }
    if (!materialCategories.length) {
      toast({
        title: t('common.error'),
        description: t('manageMaterials.addCategoryFirst'),
        variant: 'destructive',
      })
      return
    }
    if (!categoryId.trim()) {
      toast({
        title: t('common.error'),
        description: t('manageMaterials.categoryRequired'),
        variant: 'destructive',
      })
      return
    }

    const price = parseFloat(unitPrice.replace(/[^0-9.-]/g, '')) || 0
    const quantityVal = parseInt(quantity, 10) || 0

    await onSave({
      id: material?.id,
      name: materialName.trim(),
      categoryId,
      unitPrice: price,
      quantity: quantityVal,
    })
  }

  return (
    <ModalWrapper
      open={open}
      onClose={onClose}
      title={isEdit ? t('manageMaterials.editMaterial') : t('manageMaterials.addMaterialTitle')}
      size="lg"
      className="max-w-2xl bg-white"
      footer={
        <div className="flex justify-end">
          <Button
            type="submit"
            form="add-material-form"
            className="min-w-[100px] bg-[#00AB41] hover:bg-[#009638] text-white font-semibold"
            disabled={isSaving}
            isLoading={isSaving}
          >
            {isEdit ? t('common.updateMaterial') : t('manageMaterials.addMaterial')}
          </Button>
        </div>
      }
    >
      <form id="add-material-form" onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-foreground">
            {t('manageMaterials.generalInformation')}
          </h3>
          <div className="space-y-4">
            <FormInput
              label={t('manageMaterials.materialName')}
              placeholder="Portland Cement OPC"
              value={materialName}
              onChange={(e) => setMaterialName(e.target.value)}
              required
            />
            <div className="space-y-2">
              <Label>{t('manageMaterials.category')}</Label>
              <Select
                value={categoryId || undefined}
                onValueChange={setCategoryId}
                disabled={materialCategories.length === 0}
              >
                <SelectTrigger className="h-11 rounded-md border-gray-200 bg-background">
                  <SelectValue
                    placeholder={
                      materialCategories.length === 0
                        ? t('manageMaterials.noCategoriesAddInTab')
                        : t('manageMaterials.selectCategory')
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {materialCategories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-bold text-foreground">
            {t('manageMaterials.priceAndRate')}
          </h3>
          <div>
            <FormInput
              label={t('manageMaterials.unitPrice')}
              placeholder="8.75"
              value={unitPrice}
              onChange={(e) => setUnitPrice(e.target.value)}
              type="number"
              min={0}
              step="0.01"
            />
            <FormInput
              className="sm:col-span-2"
              label={t('manageMaterials.quantity')}
              placeholder="150"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              type="number"
              min={0}
            />
          </div>
        </div>
      </form>
    </ModalWrapper>
  )
}
