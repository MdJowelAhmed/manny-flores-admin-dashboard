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
import { VehicleTable } from './components/VehicleTable'
import { ViewVehicleDetailsModal } from './components/ViewVehicleDetailsModal'
import { AddEditVehicleModal } from './components/AddEditVehicleModal'
import { mockVehiclesData } from './vehicleMaintenanceData'
import type { Vehicle } from '@/types'
import { toast } from '@/utils/toast'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import { deleteVehicleCategory } from '@/redux/slices/vehicleCategorySlice'
import type { VehicleCategory } from '@/types'
import { DEFAULT_PAGINATION } from '@/utils/constants'
import { VehicleCategoriesTable } from './components/VehicleCategoriesTable'
import { AddEditVehicleCategoryModal } from './components/AddEditVehicleCategoryModal'

export default function VehicleMaintenance() {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const vehicleCategories = useAppSelector((s) => s.vehicleCategories.list)
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

  const [vehicles, setVehicles] = useState<Vehicle[]>(mockVehiclesData)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null)
  const [vehicleToDelete, setVehicleToDelete] = useState<Vehicle | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const [categoryModalOpen, setCategoryModalOpen] = useState(false)
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null)
  const [categoryToDelete, setCategoryToDelete] = useState<VehicleCategory | null>(null)
  const [isDeletingCategory, setIsDeletingCategory] = useState(false)
  const [categoryPage, setCategoryPage] = useState(DEFAULT_PAGINATION.page)
  const [categoryLimit, setCategoryLimit] = useState(DEFAULT_PAGINATION.limit)

  const selectedCategory =
    vehicleCategories.find((c) => c.id === editingCategoryId) ?? null

  const filteredVehicles = useMemo(() => {
    return vehicles.filter((v) => {
      const matchesSearch =
        !searchQuery ||
        v.vehicleName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.assignedTo.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesSearch
    })
  }, [vehicles, searchQuery])

  const totalPages = Math.max(1, Math.ceil(filteredVehicles.length / itemsPerPage))

  useEffect(() => {
    if (currentPage > totalPages && totalPages >= 1) setPage(1)
  }, [totalPages, currentPage])

  const paginatedVehicles = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return filteredVehicles.slice(start, start + itemsPerPage)
  }, [filteredVehicles, currentPage, itemsPerPage])

  const paginatedCategories = useMemo(() => {
    const start = (categoryPage - 1) * categoryLimit
    return vehicleCategories.slice(start, start + categoryLimit)
  }, [vehicleCategories, categoryLimit, categoryPage])

  const categoryTotalPages = Math.max(
    1,
    Math.ceil(vehicleCategories.length / categoryLimit)
  )

  const handleCategoryPageChange = (newPage: number) => setCategoryPage(newPage)
  const handleCategoryLimitChange = (newLimit: number) => {
    setCategoryLimit(newLimit)
    setCategoryPage(1)
  }

  const handleView = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle)
    setIsViewModalOpen(true)
  }

  const handleEdit = (vehicle: Vehicle, e: React.MouseEvent) => {
    e?.stopPropagation?.()
    setSelectedVehicle(vehicle)
    setIsViewModalOpen(false)
    setIsAddEditModalOpen(true)
  }

  const handleOpenEditFromView = () => {
    if (selectedVehicle) {
      setIsViewModalOpen(false)
      setIsAddEditModalOpen(true)
    }
  }

  const handleAdd = () => {
    setSelectedVehicle(null)
    setIsAddEditModalOpen(true)
  }

  const handleAddCategory = () => {
    setEditingCategoryId(null)
    setCategoryModalOpen(true)
    setCategoryPage(1)
  }

  const handleEditCategory = (c: VehicleCategory) => {
    setEditingCategoryId(c.id)
    setCategoryModalOpen(true)
  }

  const handleDeleteCategory = (c: VehicleCategory) => {
    const inUse = vehicles.some((v) => v.category === c.name)
    if (inUse) {
      toast({
        title: t('common.error'),
        description: `Category "${c.name}" is in use by existing vehicles.`,
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
      dispatch(deleteVehicleCategory(categoryToDelete.id))
      toast({
        variant: 'success',
        title: 'Category deleted',
        description: `Category "${categoryToDelete.name}" removed successfully.`,
      })
      setCategoryToDelete(null)
      const nextTotalPages = Math.max(
        1,
        Math.ceil((vehicleCategories.length - 1) / categoryLimit)
      )
      if (categoryPage > nextTotalPages) setCategoryPage(nextTotalPages)
    } finally {
      setIsDeletingCategory(false)
    }
  }

  const handleSave = (data: Partial<Vehicle>) => {
    if (selectedVehicle) {
      setVehicles((prev) =>
        prev.map((v) =>
          v.id === selectedVehicle.id ? { ...v, ...data } : v
        )
      )
    } else {
      const newVehicle: Vehicle = {
        id: data.id ?? `v-${Date.now()}`,
        vehicleName: data.vehicleName ?? '',
        category: data.category ?? '',
        type: data.type ?? '',
        assignedTo: data.assignedTo ?? '',
        usage: (data as Vehicle).usage ?? '0 km',
        nextService: data.nextService ?? '',
        status: (data as Vehicle).status ?? 'Available',
        model: data.model ?? '',
        year: data.year ?? '',
        purchaseDate: data.purchaseDate ?? '',
        purchaseCost: data.purchaseCost ?? '',
        insuranceExpiry: data.insuranceExpiry ?? '',
        assignedEmployee: data.assignedEmployee,
        lastService: data.lastService ?? '',
      }
      setVehicles((prev) => [newVehicle, ...prev])
    }
    setIsAddEditModalOpen(false)
    setSelectedVehicle(null)
  }

  const handleDelete = (vehicle: Vehicle) => {
    setVehicleToDelete(vehicle)
    setIsConfirmOpen(true)
  }

  const handleDeleteFromView = () => {
    if (selectedVehicle) {
      setVehicleToDelete(selectedVehicle)
      setIsViewModalOpen(false)
      setIsConfirmOpen(true)
    }
  }

  const handleConfirmDelete = async () => {
    if (!vehicleToDelete) return
    setIsDeleting(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 300))
      setVehicles((prev) => prev.filter((v) => v.id !== vehicleToDelete.id))
      toast({
        variant: 'success',
        title: t('vehicleMaintenance.vehicleDeleted'),
        description: t('vehicleMaintenance.vehicleRemoved', { name: vehicleToDelete.vehicleName }),
      })
      setIsConfirmOpen(false)
      setVehicleToDelete(null)
      if (selectedVehicle?.id === vehicleToDelete.id) {
        setSelectedVehicle(null)
        setIsViewModalOpen(false)
        setIsAddEditModalOpen(false)
      }
    } catch {
      toast({ title: t('common.error'), description: t('vehicleMaintenance.failedToDelete'), variant: 'destructive' })
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
        <h2 className="text-xl font-bold text-accent">{t('vehicleMaintenance.trackVehicles')}</h2>
      </div>

      <Tabs defaultValue="vehicles" className="w-full space-y-4">
        <TabsList className="grid w-full max-w-md grid-cols-2 bg-muted/60 p-1 h-auto rounded-lg">
          <TabsTrigger value="vehicles" className="rounded-md py-2.5">
            Vehicles
          </TabsTrigger>
          <TabsTrigger value="categories" className="rounded-md py-2.5">
            Vehicle Categories
          </TabsTrigger>
        </TabsList>

        <TabsContent value="vehicles" className="mt-0 space-y-4">
          <div className="flex items-center justify-end gap-3">
            <SearchInput
              value={searchQuery}
              onChange={setSearch}
              placeholder={t('vehicleMaintenance.searchVehicles')}
              className="w-[280px] bg-white"
              debounceMs={150}
            />
            <Button onClick={handleAdd} className="bg-primary hover:bg-primary/90 text-white">
              <Plus className="h-4 w-4 mr-2" />
              {t('vehicleMaintenance.addVehicles')}
            </Button>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <VehicleTable
              vehicles={paginatedVehicles}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />

            {filteredVehicles.length > 0 && (
              <div className="border-t border-gray-100 px-6 py-4">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={filteredVehicles.length}
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
            <VehicleCategoriesTable
              categories={paginatedCategories}
              onEdit={handleEditCategory}
              onDelete={handleDeleteCategory}
            />
            <Pagination
              currentPage={categoryPage}
              totalPages={categoryTotalPages}
              totalItems={vehicleCategories.length}
              itemsPerPage={categoryLimit}
              onPageChange={handleCategoryPageChange}
              onItemsPerPageChange={handleCategoryLimitChange}
            />
          </div>
        </TabsContent>
      </Tabs>

      <ViewVehicleDetailsModal
        open={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false)
          setSelectedVehicle(null)
        }}
        vehicle={selectedVehicle}
        onEdit={handleOpenEditFromView}
        onDelete={handleDeleteFromView}
      />

      <AddEditVehicleModal
        open={isAddEditModalOpen}
        onClose={() => {
          setIsAddEditModalOpen(false)
          setSelectedVehicle(null)
        }}
        vehicle={selectedVehicle}
        onSave={handleSave}
      />

      <AddEditVehicleCategoryModal
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
          setVehicleToDelete(null)
        }}
        onConfirm={handleConfirmDelete}
        title={t('vehicleMaintenance.deleteVehicle')}
        description={t('vehicleMaintenance.deleteVehicleConfirm', { name: vehicleToDelete?.vehicleName ?? '' })}
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
