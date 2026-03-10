import { useMemo, useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Plus } from 'lucide-react'
import { CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { SearchInput } from '@/components/common/SearchInput'
import { Pagination } from '@/components/common/Pagination'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { EquipmentTable } from './components/EquipmentTable'
import { ViewEquipmentDetailsModal } from './components/ViewEquipmentDetailsModal'
import { AddEditEquipmentModal } from './components/AddEditEquipmentModal'
import { mockEquipmentData } from './equipmentMaintenanceData'
import type { Equipment } from '@/types'
import { toast } from '@/utils/toast'

export default function EquipmentMaintenance() {
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

  const filteredEquipment = useMemo(() => {
    return equipment.filter((e) => {
      const matchesSearch =
        !searchQuery ||
        e.equipmentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
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
        title: 'Equipment Deleted',
        description: `${equipmentToDelete.equipmentName} has been removed.`,
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
        title: 'Error',
        description: 'Failed to delete equipment.',
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
      <div className="border-0">
        <CardHeader className="flex flex-row items-center justify-between pb-6">
          <CardTitle className="text-xl font-bold text-accent">Track Equipment</CardTitle>
          <div className="flex items-center gap-3">
            <SearchInput
              value={searchQuery}
              onChange={setSearch}
              placeholder="Search equipment..."
              className="w-[280px] bg-white"
              debounceMs={150}
            />
            <Button onClick={handleAdd} className="bg-primary hover:bg-primary/90 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Add Equipment
            </Button>
          </div>
        </CardHeader>

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
      </div>

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

      <ConfirmDialog
        open={isConfirmOpen}
        onClose={() => {
          setIsConfirmOpen(false)
          setEquipmentToDelete(null)
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Equipment"
        description={`Are you sure you want to delete "${equipmentToDelete?.equipmentName}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
        isLoading={isDeleting}
      />
    </motion.div>
  )
}
