import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { SearchInput } from '@/components/common/SearchInput'
import { Pagination } from '@/components/common/Pagination'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { EquipmentTable } from './components/EquipmentTable'
import { ViewEquipmentDetailsModal } from './components/ViewEquipmentDetailsModal'
import {
  AddEditEquipmentModal,
  type EquipmentFormSavePayload,
} from './components/AddEditEquipmentModal'
import { EquipmentCategoriesTable } from './components/EquipmentCategoriesTable'
import { AddEditEquipmentCategoryModal } from './components/AddEditEquipmentCategoryModal'
import type { EquipmentCategory } from '@/types'
import type { EquipmentListItem } from './equipmentMaintenanceData'
import { toast } from '@/utils/toast'
import { DEFAULT_PAGINATION } from '@/utils/constants'
import {
  useGetCategoriesQuery,
  useDeleteCategoryMutation,
  mapCategoryFromApi,
} from '@/redux/api/categoryApi'
import {
  useGetEquipmentQuery,
  useAddEquipmentMutation,
  useUpdateEquipmentMutation,
  useDeleteEquipmentMutation,
  mapEquipmentFromApi,
} from '@/redux/api/equipmentApi'

export default function EquipmentMaintenance() {
  const { t } = useTranslation()

  const [searchQuery, setSearchQuery] = useState('')
  const [equipmentPage, setEquipmentPage] = useState(DEFAULT_PAGINATION.page)
  const [equipmentLimit, setEquipmentLimit] = useState(DEFAULT_PAGINATION.limit)

  const [selectedEquipment, setSelectedEquipment] = useState<EquipmentListItem | null>(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [equipmentToDelete, setEquipmentToDelete] = useState<EquipmentListItem | null>(null)

  const [categoryModalOpen, setCategoryModalOpen] = useState(false)
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null)
  const [categoryToDelete, setCategoryToDelete] = useState<EquipmentCategory | null>(null)
  const [categoryPage, setCategoryPage] = useState(DEFAULT_PAGINATION.page)
  const [categoryLimit, setCategoryLimit] = useState(DEFAULT_PAGINATION.limit)

  const {
    data: equipmentResponse,
    isLoading: isEquipmentLoading,
    isFetching: isEquipmentFetching,
  } = useGetEquipmentQuery({ page: equipmentPage, limit: equipmentLimit })

  const { data: categoriesResponse, isLoading: isCategoriesLoading } =
    useGetCategoriesQuery({ type: 'EQUIPMENT' })

  const [addEquipment, { isLoading: isAdding }] = useAddEquipmentMutation()
  const [updateEquipment, { isLoading: isUpdating }] = useUpdateEquipmentMutation()
  const [deleteEquipment, { isLoading: isDeleting }] = useDeleteEquipmentMutation()
  const [deleteCategory, { isLoading: isDeletingCategory }] = useDeleteCategoryMutation()

  const equipmentCategories = useMemo(
    () => (categoriesResponse?.data ?? []).map(mapCategoryFromApi),
    [categoriesResponse]
  )

  const categoryNameById = useMemo(() => {
    const map: Record<string, string> = {}
    for (const c of equipmentCategories) map[c.id] = c.name
    return map
  }, [equipmentCategories])

  const equipment = useMemo(
    () =>
      (equipmentResponse?.data ?? []).map((doc) =>
        mapEquipmentFromApi(doc, categoryNameById)
      ),
    [equipmentResponse, categoryNameById]
  )

  const filteredEquipment = useMemo(() => {
    if (!searchQuery.trim()) return equipment
    const q = searchQuery.toLowerCase()
    return equipment.filter(
      (e) =>
        e.equipmentName.toLowerCase().includes(q) ||
        e.category.toLowerCase().includes(q)
    )
  }, [equipment, searchQuery])

  const equipmentPagination = equipmentResponse?.pagination
  const equipmentTotalPages = equipmentPagination?.totalPage ?? 1
  const equipmentTotalItems = equipmentPagination?.total ?? equipment.length

  const selectedCategory =
    equipmentCategories.find((c) => c.id === editingCategoryId) ?? null

  const paginatedCategories = useMemo(() => {
    const start = (categoryPage - 1) * categoryLimit
    return equipmentCategories.slice(start, start + categoryLimit)
  }, [equipmentCategories, categoryLimit, categoryPage])

  const categoryTotalPages = Math.max(
    1,
    Math.ceil(equipmentCategories.length / categoryLimit)
  )

  const handleEquipmentPageChange = (newPage: number) => setEquipmentPage(newPage)
  const handleEquipmentLimitChange = (newLimit: number) => {
    setEquipmentLimit(newLimit)
    setEquipmentPage(1)
  }

  const handleCategoryPageChange = (newPage: number) => setCategoryPage(newPage)
  const handleCategoryLimitChange = (newLimit: number) => {
    setCategoryLimit(newLimit)
    setCategoryPage(1)
  }

  const handleView = (item: EquipmentListItem) => {
    setSelectedEquipment(item)
    setIsViewModalOpen(true)
  }

  const handleEdit = (item: EquipmentListItem, e: React.MouseEvent) => {
    e?.stopPropagation?.()
    setSelectedEquipment(item)
    setIsViewModalOpen(false)
    setIsAddEditModalOpen(true)
  }

  const handleAdd = () => {
    setSelectedEquipment(null)
    setIsAddEditModalOpen(true)
    setEquipmentPage(1)
  }

  const handleOpenEditFromView = () => {
    if (selectedEquipment) {
      setIsViewModalOpen(false)
      setIsAddEditModalOpen(true)
    }
  }

  const handleSave = async (data: EquipmentFormSavePayload) => {
    const body = {
      equipmentName: data.equipmentName,
      categoryId: data.categoryId,
      purchaseDate: data.purchaseDate,
      purchaseCost: data.purchaseCost,
      warrantyExpiryDate: data.warrantyExpiryDate,
    }

    try {
      if (data.id) {
        await updateEquipment({ id: data.id, ...body }).unwrap()
        toast({
          title: t('common.success'),
          description: t('equipmentMaintenance.equipmentUpdated'),
          variant: 'success',
        })
      } else {
        await addEquipment(body).unwrap()
        toast({
          title: t('common.success'),
          description: t('equipmentMaintenance.equipmentCreated'),
          variant: 'success',
        })
        setEquipmentPage(1)
      }
      setIsAddEditModalOpen(false)
      setSelectedEquipment(null)
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

  const handleDelete = (item: EquipmentListItem) => {
    setEquipmentToDelete(item)
    setIsConfirmOpen(true)
  }

  const handleDeleteFromView = () => {
    if (selectedEquipment) {
      setEquipmentToDelete(selectedEquipment)
      setIsViewModalOpen(false)
      setIsConfirmOpen(true)
    }
  }

  const handleConfirmDelete = async () => {
    if (!equipmentToDelete) return
    try {
      await deleteEquipment(equipmentToDelete.id).unwrap()
      toast({
        variant: 'success',
        title: t('equipmentMaintenance.equipmentDeleted'),
        description: t('equipmentMaintenance.equipmentRemoved', {
          name: equipmentToDelete.equipmentName,
        }),
      })
      setIsConfirmOpen(false)
      setEquipmentToDelete(null)
      if (selectedEquipment?.id === equipmentToDelete.id) {
        setSelectedEquipment(null)
        setIsViewModalOpen(false)
      }
      if (equipment.length === 1 && equipmentPage > 1) {
        setEquipmentPage(equipmentPage - 1)
      }
    } catch {
      toast({
        title: t('common.error'),
        description: t('equipmentMaintenance.failedToDelete'),
        variant: 'destructive',
      })
    }
  }

  const handleAddCategory = () => {
    setEditingCategoryId(null)
    setCategoryModalOpen(true)
    setCategoryPage(1)
  }

  const handleEditCategory = (c: EquipmentCategory) => {
    setEditingCategoryId(c.id)
    setCategoryModalOpen(true)
  }

  const handleDeleteCategory = (c: EquipmentCategory) => {
    const inUse = equipment.some((e) => e.categoryId === c.id)
    if (inUse) {
      toast({
        title: t('common.error'),
        description: t('equipmentMaintenance.categoryInUse', { name: c.name }),
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
        title: t('equipmentMaintenance.categoryDeleted'),
        description: t('equipmentMaintenance.categoryRemoved', { name: categoryToDelete.name }),
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

  const isSavingEquipment = isAdding || isUpdating

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-xl font-bold text-accent">{t('equipmentMaintenance.trackEquipment')}</h2>
      </div>

      <Tabs defaultValue="equipments" className="w-full space-y-4">
        <TabsList className="grid w-full max-w-md grid-cols-2 bg-muted/60 p-1 h-auto rounded-lg">
          <TabsTrigger
            value="equipments"
            className="data-[state=active]:rounded-l-md data-[state=inactive]:rounded-l-md data-[state=inactive]:border"
          >
            {t('equipmentMaintenance.tabEquipments')}
          </TabsTrigger>
          <TabsTrigger
            value="categories"
            className="data-[state=active]:rounded-r-md data-[state=inactive]:rounded-r-md data-[state=inactive]:border"
          >
            {t('equipmentMaintenance.tabCategories')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="equipments" className="mt-0 space-y-4">
          <div className="flex items-center justify-end gap-3">
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder={t('equipmentMaintenance.searchEquipment')}
              className="w-[280px] bg-white"
              debounceMs={150}
            />
            <Button onClick={handleAdd} className="bg-primary hover:bg-primary/90 text-white">
              <Plus className="h-4 w-4 mr-2" />
              {t('equipmentMaintenance.addEquipment')}
            </Button>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            {isEquipmentLoading || isEquipmentFetching ? (
              <div className="px-5 py-10 text-center text-sm text-muted-foreground">
                {t('common.loading')}
              </div>
            ) : (
              <EquipmentTable
                equipment={filteredEquipment}
                onView={handleView}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            )}
            <Pagination
              currentPage={equipmentPage}
              totalPages={equipmentTotalPages}
              totalItems={equipmentTotalItems}
              itemsPerPage={equipmentLimit}
              onPageChange={handleEquipmentPageChange}
              onItemsPerPageChange={handleEquipmentLimitChange}
            />
          </div>
        </TabsContent>

        <TabsContent value="categories" className="mt-0 space-y-4">
          <div className="flex justify-end">
            <Button
              onClick={handleAddCategory}
              className="bg-[#00AB41] hover:bg-[#009638] text-white shrink-0 font-semibold shadow-sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              {t('equipmentMaintenance.addCategory')}
            </Button>
          </div>
          <div className="rounded-xl border border-gray-100 bg-white overflow-hidden shadow-sm">
            {isCategoriesLoading ? (
              <div className="px-5 py-10 text-center text-sm text-muted-foreground">
                {t('common.loading')}
              </div>
            ) : (
              <EquipmentCategoriesTable
                categories={paginatedCategories}
                onEdit={handleEditCategory}
                onDelete={handleDeleteCategory}
              />
            )}
            <Pagination
              currentPage={categoryPage}
              totalPages={categoryTotalPages}
              totalItems={equipmentCategories.length}
              itemsPerPage={categoryLimit}
              onPageChange={handleCategoryPageChange}
              onItemsPerPageChange={handleCategoryLimitChange}
            />
          </div>
        </TabsContent>
      </Tabs>

      <ViewEquipmentDetailsModal
        open={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false)
          setSelectedEquipment(null)
        }}
        equipment={selectedEquipment}
        onEdit={handleOpenEditFromView}
        onDelete={handleDeleteFromView}
      />

      <AddEditEquipmentModal
        open={isAddEditModalOpen}
        onClose={() => {
          setIsAddEditModalOpen(false)
          setSelectedEquipment(null)
        }}
        equipment={selectedEquipment}
        onSave={handleSave}
        isSaving={isSavingEquipment}
      />

      <AddEditEquipmentCategoryModal
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
          setEquipmentToDelete(null)
        }}
        onConfirm={handleConfirmDelete}
        title={t('equipmentMaintenance.deleteEquipment')}
        description={t('equipmentMaintenance.deleteEquipmentConfirm', {
          name: equipmentToDelete?.equipmentName ?? '',
        })}
        confirmText={t('common.delete')}
        cancelText={t('common.cancel')}
        variant="danger"
        isLoading={isDeleting}
      />

      <ConfirmDialog
        open={!!categoryToDelete}
        onClose={() => !isDeletingCategory && setCategoryToDelete(null)}
        onConfirm={handleConfirmDeleteCategory}
        title={t('equipmentMaintenance.deleteCategory')}
        description={t('equipmentMaintenance.deleteCategoryConfirm', {
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
