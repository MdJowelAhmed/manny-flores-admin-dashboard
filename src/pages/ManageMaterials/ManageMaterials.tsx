import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { MaterialsTable } from './components/MaterialsTable'
import { ViewMaterialDetailsModal } from './components/ViewMaterialDetailsModal'
import {
  AddEditMaterialModal,
  type MaterialFormSavePayload,
} from './components/AddEditMaterialModal'
import { MaterialCategoriesTable } from './components/MaterialCategoriesTable'
import { AddEditMaterialCategoryModal } from './components/AddEditMaterialCategoryModal'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { Pagination } from '@/components/common'
import {
  mockDrivers,
  type Material,
  type MaterialOrderSubmitPayload,
} from './manageMaterialsData'
import { MaterialOrderModal } from './components/MaterialOrderModal'
import { toast } from '@/utils/toast'
import type { MaterialCategory } from '@/types'
import { DEFAULT_PAGINATION } from '@/utils/constants'
import {
  useGetCategoriesQuery,
  useDeleteCategoryMutation,
  mapCategoryFromApi,
} from '@/redux/api/categoryApi'
import {
  useGetMaterialsQuery,
  useAddMaterialMutation,
  useUpdateMaterialMutation,
  useDeleteMaterialMutation,
  mapMaterialFromApi,
} from '@/redux/api/materialsApi'

export default function ManageMaterials() {
  const { t } = useTranslation()

  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false)
  const [isMaterialOrderModalOpen, setIsMaterialOrderModalOpen] = useState(false)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [materialToDelete, setMaterialToDelete] = useState<Material | null>(null)
  const [materialsPage, setMaterialsPage] = useState(DEFAULT_PAGINATION.page)
  const [materialsLimit, setMaterialsLimit] = useState(DEFAULT_PAGINATION.limit)

  const [categoryModalOpen, setCategoryModalOpen] = useState(false)
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null)
  const [categoryToDelete, setCategoryToDelete] = useState<MaterialCategory | null>(null)
  const [categoryPage, setCategoryPage] = useState(DEFAULT_PAGINATION.page)
  const [categoryLimit, setCategoryLimit] = useState(DEFAULT_PAGINATION.limit)

  const {
    data: materialsResponse,
    isLoading: isMaterialsLoading,
    isFetching: isMaterialsFetching,
  } = useGetMaterialsQuery({ page: materialsPage, limit: materialsLimit })

  const { data: categoriesResponse, isLoading: isCategoriesLoading } =
    useGetCategoriesQuery({ type: 'MATERIAL' })

  const [addMaterial, { isLoading: isAddingMaterial }] = useAddMaterialMutation()
  const [updateMaterial, { isLoading: isUpdatingMaterial }] = useUpdateMaterialMutation()
  const [deleteMaterial, { isLoading: isDeletingMaterial }] = useDeleteMaterialMutation()
  const [deleteCategory, { isLoading: isDeletingCategory }] = useDeleteCategoryMutation()

  const materials = useMemo(
    () => (materialsResponse?.data ?? []).map(mapMaterialFromApi),
    [materialsResponse]
  )

  const materialCategories = useMemo(
    () => (categoriesResponse?.data ?? []).map(mapCategoryFromApi),
    [categoriesResponse]
  )

  const materialsPagination = materialsResponse?.pagination
  const materialsTotalPages = materialsPagination?.totalPage ?? 1
  const materialsTotalItems = materialsPagination?.total ?? materials.length

  const selectedCategory =
    materialCategories.find((c) => c.id === editingCategoryId) ?? null

  const paginatedCategories = useMemo(() => {
    const start = (categoryPage - 1) * categoryLimit
    return materialCategories.slice(start, start + categoryLimit)
  }, [materialCategories, categoryLimit, categoryPage])

  const categoryTotalPages = Math.max(
    1,
    Math.ceil(materialCategories.length / categoryLimit)
  )

  const handleMaterialsPageChange = (newPage: number) => setMaterialsPage(newPage)
  const handleMaterialsLimitChange = (newLimit: number) => {
    setMaterialsLimit(newLimit)
    setMaterialsPage(1)
  }

  const handleCategoryPageChange = (newPage: number) => setCategoryPage(newPage)
  const handleCategoryLimitChange = (newLimit: number) => {
    setCategoryLimit(newLimit)
    setCategoryPage(1)
  }

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
    setMaterialsPage(1)
  }

  const handleMaterialOrderSubmit = (_payload: MaterialOrderSubmitPayload) => {
    /* Future: POST material orders to API */
  }

  const handleSave = async (data: MaterialFormSavePayload) => {
    const body = {
      name: data.name,
      category: data.categoryId,
      unitPrice: data.unitPrice,
      quantity: data.quantity,
    }

    try {
      if (data.id) {
        await updateMaterial({ id: data.id, ...body }).unwrap()
        toast({
          title: t('common.success'),
          description: t('manageMaterials.materialUpdated'),
          variant: 'success',
        })
      } else {
        await addMaterial(body).unwrap()
        toast({
          title: t('common.success'),
          description: t('manageMaterials.materialCreated'),
          variant: 'success',
        })
        setMaterialsPage(1)
      }
      setIsAddEditModalOpen(false)
      setSelectedMaterial(null)
    } catch (err: unknown) {
      const message =
        err &&
          typeof err === 'object' &&
          'data' in err &&
          err.data &&
          typeof err.data === 'object' &&
          'message' in err.data &&
          typeof err.data.message === 'string'
          ? err.data.message
          : t('common.error')
      toast({ title: t('common.error'), description: message, variant: 'destructive' })
    }
  }

  const handleDelete = (m: Material) => {
    setMaterialToDelete(m)
    setIsConfirmOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!materialToDelete) return
    try {
      await deleteMaterial(materialToDelete.id).unwrap()
      toast({
        variant: 'success',
        title: t('manageMaterials.materialDeleted'),
        description: t('manageMaterials.materialRemoved', {
          name: materialToDelete.materialName,
        }),
      })
      setIsConfirmOpen(false)
      setMaterialToDelete(null)
      if (selectedMaterial?.id === materialToDelete.id) {
        setSelectedMaterial(null)
      }
      if (materials.length === 1 && materialsPage > 1) {
        setMaterialsPage(materialsPage - 1)
      }
    } catch {
      toast({
        title: t('common.error'),
        description: t('manageMaterials.failedToDelete'),
        variant: 'destructive',
      })
    }
  }

  const handleAddCategory = () => {
    setEditingCategoryId(null)
    setCategoryModalOpen(true)
    setCategoryPage(1)
  }

  const handleEditCategory = (c: MaterialCategory) => {
    setEditingCategoryId(c.id)
    setCategoryModalOpen(true)
  }

  const handleDeleteCategory = (c: MaterialCategory) => {
    const inUse = materials.some((m) => m.categoryId === c.id)
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
    try {
      await deleteCategory(categoryToDelete.id).unwrap()
      toast({
        variant: 'success',
        title: t('manageMaterials.categoryDeleted'),
        description: t('manageMaterials.categoryRemoved', { name: categoryToDelete.name }),
      })
      setCategoryToDelete(null)
      if (paginatedCategories.length === 1 && categoryPage > 1) {
        setCategoryPage(categoryPage - 1)
      }
    } catch (err: unknown) {
      const message =
        err &&
          typeof err === 'object' &&
          'data' in err &&
          err.data &&
          typeof err.data === 'object' &&
          'message' in err.data &&
          typeof err.data.message === 'string'
          ? err.data.message
          : t('common.error')
      toast({ title: t('common.error'), description: message, variant: 'destructive' })
    }
  }

  const isSavingMaterial = isAddingMaterial || isUpdatingMaterial

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
          <TabsTrigger
            value="materials"
            className="data-[state=active]:rounded-l-md data-[state=inactive]:rounded-l-md data-[state=inactive]:border "
          >
            {t('manageMaterials.tabMaterials')}
          </TabsTrigger>
          <TabsTrigger
            value="categories"
            className="data-[state=active]:rounded-r-md  data-[state=inactive]:rounded-r-md data-[state=inactive]:border "
          >
            {t('manageMaterials.tabCategories')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="materials" className="mt-0 space-y-4">
          <div className="flex flex-wrap justify-end gap-2">
            {/* <Button
              type="button"
              variant="outline"
              onClick={() => setIsMaterialOrderModalOpen(true)}
              className="shrink-0 font-semibold border-[#00AB41] text-[#00AB41] hover:bg-[#00AB41]/10"
            >
              <ClipboardList className="h-4 w-4 mr-2" />
              {t('manageMaterials.materialsOrderButton')}
            </Button> */}
            <Button
              onClick={handleAdd}
              className="bg-[#00AB41] hover:bg-[#009638] text-white shrink-0 font-semibold shadow-sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              {t('manageMaterials.addMaterial')}
            </Button>
          </div>
          <div className="rounded-xl border border-gray-100 bg-white overflow-hidden shadow-sm">
            {isMaterialsLoading || isMaterialsFetching ? (
              <div className="px-5 py-10 text-center text-sm text-muted-foreground">
                {t('common.loading')}
              </div>
            ) : (
              <MaterialsTable
                materials={materials}
                onView={handleView}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            )}
            <Pagination
              currentPage={materialsPage}
              totalPages={materialsTotalPages}
              totalItems={materialsTotalItems}
              itemsPerPage={materialsLimit}
              onPageChange={handleMaterialsPageChange}
              onItemsPerPageChange={handleMaterialsLimitChange}
            />
          </div>
        </TabsContent>

        <TabsContent value="categories" className="mt-0 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-4">
            <Button
              onClick={handleAddCategory}
              className="bg-[#00AB41] hover:bg-[#009638] text-white shrink-0 font-semibold shadow-sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              {t('manageMaterials.addCategory')}
            </Button>
          </div>
          <div className="rounded-xl border border-gray-100 bg-white overflow-hidden shadow-sm">
            {isCategoriesLoading ? (
              <div className="px-5 py-10 text-center text-sm text-muted-foreground">
                {t('common.loading')}
              </div>
            ) : (
              <MaterialCategoriesTable
                categories={paginatedCategories}
                onEdit={handleEditCategory}
                onDelete={handleDeleteCategory}
              />
            )}
            <Pagination
              currentPage={categoryPage}
              totalPages={categoryTotalPages}
              totalItems={materialCategories.length}
              itemsPerPage={categoryLimit}
              onPageChange={handleCategoryPageChange}
              onItemsPerPageChange={handleCategoryLimitChange}
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
        isSaving={isSavingMaterial}
      />

      <MaterialOrderModal
        open={isMaterialOrderModalOpen}
        onClose={() => setIsMaterialOrderModalOpen(false)}
        materials={materials}
        drivers={mockDrivers}
        onSubmit={handleMaterialOrderSubmit}
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
        description={t('manageMaterials.deleteMaterialConfirm', {
          name: materialToDelete?.materialName ?? '',
        })}
        confirmText={t('common.delete')}
        cancelText={t('common.cancel')}
        variant="danger"
        isLoading={isDeletingMaterial}
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
