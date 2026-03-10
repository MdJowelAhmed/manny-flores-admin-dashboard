import { useMemo, useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Plus } from 'lucide-react'
import { CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { SearchInput } from '@/components/common/SearchInput'
import { Pagination } from '@/components/common/Pagination'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { VehicleTable } from './components/VehicleTable'
import { ViewVehicleDetailsModal } from './components/ViewVehicleDetailsModal'
import { AddEditVehicleModal } from './components/AddEditVehicleModal'
import { mockVehiclesData } from './vehicleMaintenanceData'
import type { Vehicle } from '@/types'
import { toast } from '@/utils/toast'

export default function VehicleMaintenance() {
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

  const filteredVehicles = useMemo(() => {
    return vehicles.filter((v) => {
      const matchesSearch =
        !searchQuery ||
        v.vehicleName.toLowerCase().includes(searchQuery.toLowerCase()) ||
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
        title: 'Vehicle Deleted',
        description: `${vehicleToDelete.vehicleName} has been removed.`,
      })
      setIsConfirmOpen(false)
      setVehicleToDelete(null)
      if (selectedVehicle?.id === vehicleToDelete.id) {
        setSelectedVehicle(null)
        setIsViewModalOpen(false)
        setIsAddEditModalOpen(false)
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to delete vehicle.', variant: 'destructive' })
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
      <div className="border-0">
        <CardHeader className="flex flex-row items-center justify-between pb-6">
          <CardTitle className="text-xl font-bold text-accent">Track Vehicles</CardTitle>
          <div className="flex items-center gap-3">
            <SearchInput
              value={searchQuery}
              onChange={setSearch}
              placeholder="Search vehicles..."
              className="w-[280px] bg-white"
              debounceMs={150}
            />
            <Button onClick={handleAdd} className="bg-primary hover:bg-primary/90 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Add Vehicles
            </Button>
          </div>
        </CardHeader>

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
      </div>

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

      <ConfirmDialog
        open={isConfirmOpen}
        onClose={() => {
          setIsConfirmOpen(false)
          setVehicleToDelete(null)
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Vehicle"
        description={`Are you sure you want to delete "${vehicleToDelete?.vehicleName}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
        isLoading={isDeleting}
      />
    </motion.div>
  )
}
