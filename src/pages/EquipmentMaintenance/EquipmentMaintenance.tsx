import { useMemo, useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
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
import { AddEditEquipmentModal } from './components/AddEditEquipmentModal'
import { mockEquipmentData } from './equipmentMaintenanceData'
import type { Equipment } from '@/types'
import { toast } from '@/utils/toast'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import { deleteEquipmentCategory } from '@/redux/slices/equipmentCategorySlice'
import type { EquipmentCategory } from '@/types'
import { DEFAULT_PAGINATION } from '@/utils/constants'
import { EquipmentCategoriesTable } from './components/EquipmentCategoriesTable'
import { AddEditEquipmentCategoryModal } from './components/AddEditEquipmentCategoryModal'

export default function EquipmentMaintenance() {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const equipmentCategories = useAppSelector((s) => s.equipmentCategories.list)
  const [searchParams, setSearchParams] = useSearchParams()
  const searchQuery = searchParams.get('search') ?? ''
  const currentPage = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
  const itemsPerPage = Math.max(1, parseInt(searchParams.get('limit') || '10', 10)) || 10

  const setSearch = (v: string) => {
    const next = new URLSearchParams(searchParams)
    v ? next.set('search', v) : next.delete('search')
    next.delete('page')
    setSearchParams(next, { replace: true })
  }
  const setPage = (p: number) => {
    const next = new URLSearchParams(searchParams)
    p > 1 ? next.set('page', String(p)) : next.delete('page')
    setSearchParams(next, { replace: true })
  }
  const setLimit = (l: number) => {
    const next = new URLSearchParams(searchParams)
    l !== 10 ? next.set('limit', String(l)) : next.delete('limit')
    next.delete('page')
    setSearchParams(next, { replace: true })
  }

  const [equipment, setEquipment] = useState<Equipment[]>(mockEquipmentData)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null)
  const [equipmentToDelete, setEquipmentToDelete] = useState<Equipment | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const [categoryModalOpen, setCategoryModalOpen] = useState(false)
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null)
  const [categoryToDelete, setCategoryToDelete] = useState<EquipmentCategory | null>(null)
  const [isDeletingCategory, setIsDeletingCategory] = useState(false)
  const [categoryPage, setCategoryPage] = useState(DEFAULT_PAGINATION.page)
  const [categoryLimit, setCategoryLimit] = useState(DEFAULT_PAGINATION.limit)

  const selectedCategory =
    equipmentCategories.find((c) => c.id === editingCategoryId) ?? null

  const filteredEquipment = useMemo(() => {
    return equipment.filter((e) => {
      const matchesSearch =
        !searchQuery ||
        e.equipmentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.assignedTo.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesSearch
    })
  }, [equipment, searchQuery])

  const totalPages = Math.max(1, Math.ceil(filteredEquipment.length / itemsPerPage))

  useEffect(() => {
    if (currentPage > totalPages && totalPages >= 1) setPage(1)
  }, [totalPages, currentPage])

  const paginatedEquipment = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return filteredEquipment.slice(start, start + itemsPerPage)
  }, [filteredEquipment, currentPage, itemsPerPage])

  const paginatedCategories = useMemo(() => {
    const start = (categoryPage - 1) * categoryLimit
    return equipmentCategories.slice(start, start + categoryLimit)
  }, [equipmentCategories, categoryLimit, categoryPage])

  const categoryTotalPages = Math.max(
    1,
    Math.ceil(equipmentCategories.length / categoryLimit)
  )

  const handleCategoryPageChange = (newPage: number) => setCategoryPage(newPage)
  const handleCategoryLimitChange = (newLimit: number) => {
    setCategoryLimit(newLimit)
    setCategoryPage(1)
  }

  const handleView = (item: Equipment) => {
    setSelectedEquipment(item)
    setIsViewModalOpen(true)
  }

  const handleEdit = (item: Equipment, e: React.MouseEvent) => {
    e?.stopPropagation?.()
    setSelectedEquipment(item)
    setIsViewModalOpen(false)
    setIsAddEditModalOpen(true)
  }

  const handleOpenEditFromView = () => {
    if (selectedEquipment) {
      setIsViewModalOpen(false)
      setIsAddEditModalOpen(true)
    }
  }

  const handleAdd = () => {
    setSelectedEquipment(null)
    setIsAddEditModalOpen(true)
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
    const inUse = equipment.some((e) => e.category === c.name)
    if (inUse) {
      toast({
        title: t('common.error'),
        description: `Category "${c.name}" is in use by existing equipment.`,
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
      dispatch(deleteEquipmentCategory(categoryToDelete.id))
      toast({
        variant: 'success',
        title: 'Category deleted',
        description: `Category "${categoryToDelete.name}" removed successfully.`,
      })
      setCategoryToDelete(null)
      const nextTotalPages = Math.max(
        1,
        Math.ceil((equipmentCategories.length - 1) / categoryLimit)
      )
      if (categoryPage > nextTotalPages) setCategoryPage(nextTotalPages)
    } finally {
      setIsDeletingCategory(false)
    }
  }

  const handleSave = (data: Partial<Equipment>) => {
    if (selectedEquipment) {
      setEquipment((prev) =>
        prev.map((e) => (e.id === selectedEquipment.id ? { ...e, ...data } : e))
      )
    } else {
      const newItem: Equipment = {
        id: data.id ?? `eq-${Date.now()}`,
        equipmentName: data.equipmentName ?? '',
        type: data.type ?? '',
        assignedTo: data.assignedTo ?? '',
        usage: (data as Equipment).usage ?? '0 hrs',
        nextService: data.nextService ?? '',
        status: (data as Equipment).status ?? 'Available',
        model: data.model ?? '',
        category: data.category ?? '',
        purchaseDate: data.purchaseDate ?? '',
        purchaseCost: data.purchaseCost ?? '',
        warrantyExpiry: data.warrantyExpiry ?? '',
        assignedEmployee: data.assignedEmployee,
        lastService: data.lastService ?? '',
      }
      setEquipment((prev) => [newItem, ...prev])
    }
    setIsAddEditModalOpen(false)
    setSelectedEquipment(null)
  }

  const handleDelete = (item: Equipment) => {
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
    setIsDeleting(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 300))
      setEquipment((prev) => prev.filter((e) => e.id !== equipmentToDelete.id))
      toast({
        variant: 'success',
        title: t('equipmentMaintenance.equipmentDeleted'),
        description: t('equipmentMaintenance.equipmentRemoved', { name: equipmentToDelete.equipmentName }),
      })
      setIsConfirmOpen(false)
      setEquipmentToDelete(null)
      if (selectedEquipment?.id === equipmentToDelete.id) {
        setSelectedEquipment(null)
        setIsViewModalOpen(false)
        setIsAddEditModalOpen(false)
      }
    } catch {
      toast({
        title: t('common.error'),
        description: t('equipmentMaintenance.failedToDelete'),
        variant: 'destructive',
      })
    } finally {
      setIsDeleting(false)
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
        <h2 className="text-xl font-bold text-accent">{t('equipmentMaintenance.trackEquipment')}</h2>
      </div>

      <Tabs defaultValue="equipments" className="w-full space-y-4">
        <TabsList className="grid w-full max-w-md grid-cols-2 bg-muted/60 p-1 h-auto rounded-lg">
          <TabsTrigger value="equipments" className="data-[state=active]:rounded-l-md data-[state=inactive]:rounded-l-md data-[state=inactive]:border">
            Equipments
          </TabsTrigger>
          <TabsTrigger value="categories" className="data-[state=active]:rounded-r-md  data-[state=inactive]:rounded-r-md data-[state=inactive]:border">
            Equipment Categories
          </TabsTrigger>
        </TabsList>

        <TabsContent value="equipments" className="mt-0 space-y-4">
          <div className="flex items-center justify-end gap-3">
            <SearchInput
              value={searchQuery}
              onChange={setSearch}
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
            <EquipmentTable
              equipment={paginatedEquipment}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />

            {filteredEquipment.length > 0 && (
              <div className="border-t border-gray-100 px-6 py-4">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={filteredEquipment.length}
                  itemsPerPage={itemsPerPage}
                  onPageChange={setPage}
                  onItemsPerPageChange={setLimit}
                />
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="categories" className="mt-0 space-y-4">
          <div className="flex justify-end">
            <Button
              onClick={handleAddCategory}
              className="bg-[#00AB41] hover:bg-[#009638] text-white shrink-0 font-semibold shadow-sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Category
            </Button>
          </div>

          <div className="rounded-xl border border-gray-100 bg-white overflow-hidden shadow-sm">
            <EquipmentCategoriesTable
              categories={paginatedCategories}
              onEdit={handleEditCategory}
              onDelete={handleDeleteCategory}
            />
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
        description={t('equipmentMaintenance.deleteEquipmentConfirm', { name: equipmentToDelete?.equipmentName ?? '' })}
        confirmText={t('common.delete')}
        cancelText={t('common.cancel')}
        variant="danger"
        isLoading={isDeleting}
      />

      <ConfirmDialog
        open={!!categoryToDelete}
        onClose={() => !isDeletingCategory && setCategoryToDelete(null)}
        onConfirm={handleConfirmDeleteCategory}
        title="Delete Category"
        description={`Are you sure you want to delete "${categoryToDelete?.name ?? ''}"?`}
        confirmText="Delete"
        cancelText={t('common.cancel')}
        variant="danger"
        isLoading={isDeletingCategory}
      />
    </motion.div>
  )
}
