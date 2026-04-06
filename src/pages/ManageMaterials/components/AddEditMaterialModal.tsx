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
import type { Material } from '../manageMaterialsData'
import { MATERIAL_CATEGORIES } from '../manageMaterialsData'
import { toast } from '@/utils/toast'

interface AddEditMaterialModalProps {
  open: boolean
  onClose: () => void
  material: Material | null
  onSave: (data: Partial<Material>) => void
}

export function AddEditMaterialModal({
  open,
  onClose,
  material,
  onSave,
}: AddEditMaterialModalProps) {
  const { t } = useTranslation()
  const isEdit = !!material?.id

  const [materialName, setMaterialName] = useState('')
  const [category, setCategory] = useState<string>(MATERIAL_CATEGORIES[0])
  const [unitPrice, setUnitPrice] = useState('')
  const [totalStock, setTotalStock] = useState('')
  const [minimumStock, setMinimumStock] = useState('')

  const categoryOptions = useMemo(() => {
    const set = new Set<string>([...MATERIAL_CATEGORIES])
    if (material?.category) set.add(material.category)
    return Array.from(set)
  }, [material?.category, open])

  useEffect(() => {
    if (material) {
      setMaterialName(material.materialName)
      setCategory(material.category || MATERIAL_CATEGORIES[0])
      setUnitPrice(String(material.unitPrice ?? material.costPrice ?? ''))
      setTotalStock(String(material.currentStock))
      setMinimumStock(String(material.minimumStock ?? 0))
    } else {
      setMaterialName('')
      setCategory(MATERIAL_CATEGORIES[0])
      setUnitPrice('')
      setTotalStock('')
      setMinimumStock('')
    }
  }, [material, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!materialName.trim()) {
      toast({
        title: t('common.error'),
        description: t('manageMaterials.nameRequired'),
        variant: 'destructive',
      })
      return
    }

    const price = parseFloat(unitPrice.replace(/[^0-9.-]/g, '')) || 0
    const stock = parseInt(totalStock, 10) || 0
    const minStock = parseInt(minimumStock, 10) || 0

    onSave({
      id: material?.id,
      materialName: materialName.trim(),
      category,
      unitPrice: price,
      costPrice: price,
      projectRate: price * 2,
      currentStock: stock,
      minimumStock: minStock,
      supplier: material?.supplier ?? '',
      supplierEmail: material?.supplierEmail ?? '',
      supplierContact: material?.supplierContact ?? '',
      lastPurchaseDate: material?.lastPurchaseDate ?? '',
      unit: material?.unit ?? 'bag',
      assignedProject: material?.assignedProject ?? '',
      assignedProjects: material?.assignedProjects ?? [],
      allocated: material?.allocated ?? 0,
      jobAllocations: material?.jobAllocations ?? [],
    })

    toast({
      title: t('common.success'),
      description: isEdit
        ? t('manageMaterials.materialUpdated')
        : t('manageMaterials.materialCreated'),
      variant: 'success',
    })
    onClose()
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
          >
            {isEdit ? t('common.updateMaterial') : t('manageMaterials.addMaterial')}
          </Button>
        </div>
      }
    >
      <form id="add-material-form" onSubmit={handleSubmit} className="space-y-5">
        <div className=" space-y-4">
          <h3 className="text-sm font-bold text-foreground">
            {t('manageMaterials.generalInformation')}
          </h3>
          <div className="space-y-4">
            <FormInput
              label={t('manageMaterials.materialName')}
              placeholder="Topsoil"
              value={materialName}
              onChange={(e) => setMaterialName(e.target.value)}
              required
            />
            <div className="space-y-2">
              <Label>{t('manageMaterials.category')}</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="h-11 rounded-md border-gray-200 bg-background">
                  <SelectValue placeholder={t('manageMaterials.selectCategory')} />
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
          </div>
        </div>

        <div className=" space-y-4">
          <h3 className="text-sm font-bold text-foreground">
            {t('manageMaterials.priceAndRate')}
          </h3>
          <div className="">
            <FormInput
              label={t('manageMaterials.unitPrice')}
              placeholder="$12"
              value={unitPrice}
              onChange={(e) => setUnitPrice(e.target.value)}
            />
            <FormInput
              label={t('manageMaterials.totalStockLabel')}
              placeholder="10"
              value={totalStock}
              onChange={(e) => setTotalStock(e.target.value)}
              type="number"
              min={0}
            />
            <FormInput
              className="sm:col-span-2"
              label={t('manageMaterials.minimumStock')}
              placeholder="2"
              value={minimumStock}
              onChange={(e) => setMinimumStock(e.target.value)}
              type="number"
              min={0}
            />
          </div>
        </div>
      </form>
    </ModalWrapper>
  )
}
