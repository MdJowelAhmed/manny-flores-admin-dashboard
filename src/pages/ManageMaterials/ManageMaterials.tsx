import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { MaterialsTable } from './components/MaterialsTable'
import { ViewMaterialDetailsModal } from './components/ViewMaterialDetailsModal'
import { AddEditMaterialModal } from './components/AddEditMaterialModal'
import { MaterialCategoriesTable } from './components/MaterialCategoriesTable'
import { AddEditMaterialCategoryModal } from './components/AddEditMaterialCategoryModal'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { mockMaterialsData, type Material } from './manageMaterialsData'
import { toast } from '@/utils/toast'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import { deleteMaterialCategory } from '@/redux/slices/materialCategorySlice'
import type { MaterialCategory } from '@/types'

export default function ManageMaterials() {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const materialCategories = useAppSelector((s) => s.materialCategories.list)

  const [materials, setMaterials] = useState<Material[]>(mockMaterialsData)
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [materialToDelete, setMaterialToDelete] = useState<Material | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const [categoryModalOpen, setCategoryModalOpen] = useState(false)
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null)
  const [categoryToDelete, setCategoryToDelete] = useState<MaterialCategory | null>(null)
  const [isDeletingCategory, setIsDeletingCategory] = useState(false)

  const selectedCategory =
    materialCategories.find((c) => c.id === editingCategoryId) ?? null

  const handleView = (m: Material) => {
    setSelectedMaterial(m)
    setIsViewModalOpen(true)
  }

  const handleEdit = (m: Material, e: React.MouseEvent) => {
    e?.stopPropagation?.()
    setSelectedMaterial(m)
    setIsViewModalOpen(false)
    setIsAddEditModalOpen(true)
  }

  const handleAdd = () => {
    setSelectedMaterial(null)
    setIsAddEditModalOpen(true)
  }

  const handleSave = (data: Partial<Material>) => {
    if (data.id) {
      setMaterials((prev) =>
        prev.map((m) =>
          m.id === data.id
            ? {
                ...m,
                ...data,
                allocated: data.allocated ?? m.allocated,
                jobAllocations: data.jobAllocations ?? m.jobAllocations,
              }
            : m
        )
      )
    } else {
      const newMaterial: Material = {
        id: `mat-${Date.now()}`,
        materialName: data.materialName ?? '',
        category: data.category ?? '',
        unit: data.unit ?? 'bag',
        currentStock: data.currentStock ?? 0,
        allocated: 0,
        supplier: data.supplier ?? '',
        costPrice: data.costPrice ?? 0,
        projectRate: data.projectRate ?? 0,
        assignedProject: data.assignedProject ?? '',
        unitPrice: data.unitPrice ?? 0,
        minimumStock: data.minimumStock ?? 0,
        supplierEmail: data.supplierEmail ?? '',
        supplierContact: data.supplierContact ?? '',
        lastPurchaseDate: data.lastPurchaseDate ?? '',
        assignedProjects: data.assignedProjects ?? [],
        jobAllocations: [],
      }
      setMaterials((prev) => [newMaterial, ...prev])
    }
  }

  const handleDelete = (m: Material) => {
    setMaterialToDelete(m)
    setIsConfirmOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!materialToDelete) return
    setIsDeleting(true)
    try {
      await new Promise((r) => setTimeout(r, 300))
      setMaterials((prev) => prev.filter((m) => m.id !== materialToDelete.id))
      toast({
        variant: 'success',
        title: t('manageMaterials.materialDeleted'),
        description: t('manageMaterials.materialRemoved', { name: materialToDelete.materialName }),
      })
      setIsConfirmOpen(false)
      setMaterialToDelete(null)
      if (selectedMaterial?.id === materialToDelete.id) {
        setSelectedMaterial(null)
      }
    } catch {
      toast({ title: t('common.error'), description: t('manageMaterials.failedToDelete'), variant: 'destructive' })
    } finally {
      setIsDeleting(false)
    }
  }

  const handleAddCategory = () => {
    setEditingCategoryId(null)
    setCategoryModalOpen(true)
  }

  const handleEditCategory = (c: MaterialCategory) => {
    setEditingCategoryId(c.id)
    setCategoryModalOpen(true)
  }

  const handleDeleteCategory = (c: MaterialCategory) => {
    const inUse = materials.some((m) => m.category === c.name)
    if (inUse) {
      toast({
        title: t('common.error'),
        description: t('manageMaterials.categoryInUse', { name: c.name }),
        variant: 'destructive',
      })
      return
    }
    setCategoryToDelete(c)
  }

  const handleConfirmDeleteCategory = async () => {
    if (!categoryToDelete) return
    setIsDeletingCategory(true)
    try {
      await new Promise((r) => setTimeout(r, 300))
      dispatch(deleteMaterialCategory(categoryToDelete.id))
      toast({
        variant: 'success',
        title: t('manageMaterials.categoryDeleted'),
        description: t('manageMaterials.categoryRemoved', { name: categoryToDelete.name }),
      })
      setCategoryToDelete(null)
    } finally {
      setIsDeletingCategory(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-xl font-bold text-slate-800">
          {t('manageMaterials.pageTitle')}
        </h1>
      </div>

      <Tabs defaultValue="materials" className="w-full space-y-4">
        <TabsList className="grid w-full max-w-md grid-cols-2 bg-muted/60 p-1 h-auto rounded-lg">
          <TabsTrigger value="materials" className="rounded-md py-2.5">
            {t('manageMaterials.tabMaterials')}
          </TabsTrigger>
          <TabsTrigger value="categories" className="rounded-md py-2.5">
            {t('manageMaterials.tabCategories')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="materials" className="mt-0 space-y-4">
          <div className="flex justify-end">
            <Button
              onClick={handleAdd}
              className="bg-[#00AB41] hover:bg-[#009638] text-white shrink-0 font-semibold shadow-sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              {t('manageMaterials.addMaterial')}
            </Button>
          </div>
          <div className="rounded-xl border border-gray-100 bg-white overflow-hidden shadow-sm">
            <MaterialsTable
              materials={materials}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </div>
        </TabsContent>

        <TabsContent value="categories" className="mt-0 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-4">
            {/* <p className="text-sm text-muted-foreground">
              {t('manageMaterials.categoriesTabHint')}
            </p> */}
            <Button
              onClick={handleAddCategory}
              className="bg-[#00AB41] hover:bg-[#009638] text-white shrink-0 font-semibold shadow-sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              {t('manageMaterials.addCategory')}
            </Button>
          </div>
          <div className="rounded-xl border border-gray-100 bg-white overflow-hidden shadow-sm">
            <MaterialCategoriesTable
              categories={materialCategories}
              onEdit={handleEditCategory}
              onDelete={handleDeleteCategory}
            />
          </div>
        </TabsContent>
      </Tabs>

      <ViewMaterialDetailsModal
        open={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false)
          setSelectedMaterial(null)
        }}
        material={selectedMaterial}
      />

      <AddEditMaterialModal
        open={isAddEditModalOpen}
        onClose={() => {
          setIsAddEditModalOpen(false)
          setSelectedMaterial(null)
        }}
        material={selectedMaterial}
        onSave={handleSave}
      />

      <AddEditMaterialCategoryModal
        open={categoryModalOpen}
        onClose={() => {
          setCategoryModalOpen(false)
          setEditingCategoryId(null)
        }}
        editingId={editingCategoryId}
        category={selectedCategory}
      />

      <ConfirmDialog
        open={isConfirmOpen}
        onClose={() => {
          setIsConfirmOpen(false)
          setMaterialToDelete(null)
        }}
        onConfirm={handleConfirmDelete}
        title={t('manageMaterials.deleteMaterial')}
        description={t('manageMaterials.deleteMaterialConfirm', { name: materialToDelete?.materialName ?? '' })}
        confirmText={t('common.delete')}
        cancelText={t('common.cancel')}
        variant="danger"
        isLoading={isDeleting}
      />

      <ConfirmDialog
        open={!!categoryToDelete}
        onClose={() => !isDeletingCategory && setCategoryToDelete(null)}
        onConfirm={handleConfirmDeleteCategory}
        title={t('manageMaterials.deleteCategory')}
        description={t('manageMaterials.deleteCategoryConfirm', {
          name: categoryToDelete?.name ?? '',
        })}
        confirmText={t('common.delete')}
        cancelText={t('common.cancel')}
        variant="danger"
        isLoading={isDeletingCategory}
      />
    </motion.div>
  )
}
