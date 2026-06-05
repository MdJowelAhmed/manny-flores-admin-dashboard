import { useMemo, useState } from 'react'
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
import {
  AddEditVehicleModal,
  type VehicleFormSavePayload,
} from './components/AddEditVehicleModal'
import { toast } from '@/utils/toast'
import type { VehicleCategory } from '@/types'
import type { VehicleListItem } from './vehicleMaintenanceData'
import { DEFAULT_PAGINATION } from '@/utils/constants'
import { VehicleCategoriesTable } from './components/VehicleCategoriesTable'
import { AddEditVehicleCategoryModal } from './components/AddEditVehicleCategoryModal'
import {
  useGetCategoriesQuery,
  useDeleteCategoryMutation,
  mapCategoryFromApi,
} from '@/redux/api/categoryApi'
import {
  useGetVehiclesQuery,
  useAddVehicleMutation,
  useUpdateVehicleMutation,
  useDeleteVehicleMutation,
  mapVehicleFromApi,
} from '@/redux/api/vehiclesApi'

export default function VehicleMaintenance() {
  const { t } = useTranslation()

  const [searchQuery, setSearchQuery] = useState('')
  const [vehiclesPage, setVehiclesPage] = useState(DEFAULT_PAGINATION.page)
  const [vehiclesLimit, setVehiclesLimit] = useState(DEFAULT_PAGINATION.limit)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleListItem | null>(null)
  const [vehicleToDelete, setVehicleToDelete] = useState<VehicleListItem | null>(null)

  const [categoryModalOpen, setCategoryModalOpen] = useState(false)
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null)
  const [categoryToDelete, setCategoryToDelete] = useState<VehicleCategory | null>(null)
  const [categoryPage, setCategoryPage] = useState(DEFAULT_PAGINATION.page)
  const [categoryLimit, setCategoryLimit] = useState(DEFAULT_PAGINATION.limit)

  const {
    data: vehiclesResponse,
    isLoading: isVehiclesLoading,
    isFetching: isVehiclesFetching,
  } = useGetVehiclesQuery({ page: vehiclesPage, limit: vehiclesLimit })

  const { data: categoriesResponse, isLoading: isCategoriesLoading } =
    useGetCategoriesQuery({ type: 'VEHICLE' })

  const [addVehicle, { isLoading: isAddingVehicle }] = useAddVehicleMutation()
  const [updateVehicle, { isLoading: isUpdatingVehicle }] = useUpdateVehicleMutation()
  const [deleteVehicle, { isLoading: isDeletingVehicle }] = useDeleteVehicleMutation()
  const [deleteCategory, { isLoading: isDeletingCategory }] = useDeleteCategoryMutation()

  const vehicleCategories = useMemo(
    () => (categoriesResponse?.data ?? []).map(mapCategoryFromApi),
    [categoriesResponse]
  )

  const categoryNameById = useMemo(() => {
    const map: Record<string, string> = {}
    for (const c of vehicleCategories) map[c.id] = c.name
    return map
  }, [vehicleCategories])

  const vehicles = useMemo(
    () => (vehiclesResponse?.data ?? []).map((doc) => mapVehicleFromApi(doc, categoryNameById)),
    [vehiclesResponse, categoryNameById]
  )

  const filteredVehicles = useMemo(() => {
    if (!searchQuery.trim()) return vehicles
    const q = searchQuery.toLowerCase()
    return vehicles.filter((v) => {
      const assignedName = v.assignedEmployee?.name ?? ''
      return (
        v.model.toLowerCase().includes(q) ||
        String(v.year).includes(q) ||
        v.category.toLowerCase().includes(q) ||
        v.type.toLowerCase().includes(q) ||
        assignedName.toLowerCase().includes(q)
      )
    })
  }, [vehicles, searchQuery])

  const vehiclesPagination = vehiclesResponse?.pagination
  const vehiclesTotalPages = vehiclesPagination?.totalPage ?? 1
  const vehiclesTotalItems = vehiclesPagination?.total ?? vehicles.length

  const paginatedCategories = useMemo(() => {
    const start = (categoryPage - 1) * categoryLimit
    return vehicleCategories.slice(start, start + categoryLimit)
  }, [vehicleCategories, categoryLimit, categoryPage])

  const categoryTotalPages = Math.max(
    1,
    Math.ceil(vehicleCategories.length / categoryLimit)
  )

  const selectedCategory =
    vehicleCategories.find((c) => c.id === editingCategoryId) ?? null

  const handleVehiclesPageChange = (newPage: number) => setVehiclesPage(newPage)
  const handleVehiclesLimitChange = (newLimit: number) => {
    setVehiclesLimit(newLimit)
    setVehiclesPage(1)
  }

  const handleCategoryPageChange = (newPage: number) => setCategoryPage(newPage)
  const handleCategoryLimitChange = (newLimit: number) => {
    setCategoryLimit(newLimit)
    setCategoryPage(1)
  }

  const handleView = (vehicle: VehicleListItem) => {
    setSelectedVehicle(vehicle)
    setIsViewModalOpen(true)
  }

  const handleEdit = (vehicle: VehicleListItem, e: React.MouseEvent) => {
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
    setVehiclesPage(1)
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
    const inUse = vehicles.some((v) => v.categoryId === c.id)
    if (inUse) {
      toast({
        title: t('common.error'),
        description: t('vehicleMaintenance.categoryInUse', { name: c.name }),
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
        title: t('vehicleMaintenance.categoryDeleted'),
        description: t('vehicleMaintenance.categoryRemoved', { name: categoryToDelete.name }),
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

  const handleSave = async (data: VehicleFormSavePayload) => {
    const body = {
      model: data.model,
      year: data.year,
      type: data.type,
      categoryId: data.categoryId,
      purchaseDate: data.purchaseDate,
      purchaseCost: data.purchaseCost,
      insuranceExpires: data.insuranceExpires,
      maintenanceLastServiceDate: data.maintenanceLastServiceDate,
      maintenanceNextServiceDate: data.maintenanceNextServiceDate,
    }

    try {
      if (data.id) {
        await updateVehicle({ id: data.id, ...body }).unwrap()
        toast({
          title: t('common.success'),
          description: t('vehicleMaintenance.vehicleUpdated'),
          variant: 'success',
        })
      } else {
        await addVehicle(body).unwrap()
        toast({
          title: t('common.success'),
          description: t('vehicleMaintenance.vehicleCreated'),
          variant: 'success',
        })
        setVehiclesPage(1)
      }
      setIsAddEditModalOpen(false)
      setSelectedVehicle(null)
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

  const handleDelete = (vehicle: VehicleListItem) => {
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
    try {
      await deleteVehicle(vehicleToDelete.id).unwrap()
      toast({
        variant: 'success',
        title: t('vehicleMaintenance.vehicleDeleted'),
        description: t('vehicleMaintenance.vehicleRemoved', {
          name: `${vehicleToDelete.model} (${vehicleToDelete.year})`,
        }),
      })
      setIsConfirmOpen(false)
      setVehicleToDelete(null)
      if (selectedVehicle?.id === vehicleToDelete.id) {
        setSelectedVehicle(null)
        setIsViewModalOpen(false)
        setIsAddEditModalOpen(false)
      }
      if (vehicles.length === 1 && vehiclesPage > 1) {
        setVehiclesPage(vehiclesPage - 1)
      }
    } catch {
      toast({ title: t('common.error'), description: t('vehicleMaintenance.failedToDelete'), variant: 'destructive' })
    }
  }

  const isSavingVehicle = isAddingVehicle || isUpdatingVehicle

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
          <TabsTrigger value="vehicles" className="data-[state=active]:rounded-l-md data-[state=inactive]:rounded-l-md data-[state=inactive]:border">
            Vehicles
          </TabsTrigger>
          <TabsTrigger value="categories" className="data-[state=active]:rounded-r-md  data-[state=inactive]:rounded-r-md data-[state=inactive]:border">
            Vehicle Categories
          </TabsTrigger>
        </TabsList>

        <TabsContent value="vehicles" className="mt-0 space-y-4">
          <div className="flex items-center justify-end gap-3">
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
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
            {isVehiclesLoading || isVehiclesFetching ? (
              <div className="px-5 py-10 text-center text-sm text-muted-foreground">
                {t('common.loading')}
              </div>
            ) : (
              <VehicleTable
                vehicles={filteredVehicles}
                onView={handleView}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            )}
            <Pagination
              currentPage={vehiclesPage}
              totalPages={vehiclesTotalPages}
              totalItems={vehiclesTotalItems}
              itemsPerPage={vehiclesLimit}
              onPageChange={handleVehiclesPageChange}
              onItemsPerPageChange={handleVehiclesLimitChange}
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
              {t('vehicleMaintenance.addCategory')}
            </Button>
          </div>

          <div className="rounded-xl border border-gray-100 bg-white overflow-hidden shadow-sm">
            {isCategoriesLoading ? (
              <div className="px-5 py-10 text-center text-sm text-muted-foreground">
                {t('common.loading')}
              </div>
            ) : (
              <VehicleCategoriesTable
                categories={paginatedCategories}
                onEdit={handleEditCategory}
                onDelete={handleDeleteCategory}
              />
            )}
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
        isSaving={isSavingVehicle}
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
        description={t('vehicleMaintenance.deleteVehicleConfirm', {
          name: vehicleToDelete
            ? `${vehicleToDelete.model} (${vehicleToDelete.year})`
            : '',
        })}
        confirmText={t('common.delete')}
        cancelText={t('common.cancel')}
        variant="danger"
        isLoading={isDeletingVehicle}
      />

      <ConfirmDialog
        open={!!categoryToDelete}
        onClose={() => !isDeletingCategory && setCategoryToDelete(null)}
        onConfirm={handleConfirmDeleteCategory}
        title={t('vehicleMaintenance.deleteCategory')}
        description={t('vehicleMaintenance.deleteCategoryConfirm', {
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
