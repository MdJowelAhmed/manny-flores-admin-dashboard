import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { MaterialsTable } from './components/MaterialsTable'
import { ViewMaterialDetailsModal } from './components/ViewMaterialDetailsModal'
import { AddEditMaterialModal } from './components/AddEditMaterialModal'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { mockMaterialsData, type Material } from './manageMaterialsData'
import { toast } from '@/utils/toast'

export default function ManageMaterials() {
  const { t } = useTranslation()
  const [materials, setMaterials] = useState<Material[]>(mockMaterialsData)
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [materialToDelete, setMaterialToDelete] = useState<Material | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

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

  const handleOpenEditFromView = () => {
    if (selectedMaterial) {
      setIsViewModalOpen(false)
      setIsAddEditModalOpen(true)
    }
  }

  const handleAdd = () => {
    setSelectedMaterial(null)
    setIsAddEditModalOpen(true)
  }

  const handleSave = (data: Partial<Material>) => {
    if (data.id) {
      setMaterials((prev) =>
        prev.map((m) => (m.id === data.id ? { ...m, ...data } : m))
      )
    } else {
      const newMaterial: Material = {
        id: `mat-${Date.now()}`,
        materialName: data.materialName ?? '',
        category: data.category ?? '',
        unit: data.unit ?? 'unit',
        currentStock: data.currentStock ?? 0,
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
      }
      setMaterials((prev) => [newMaterial, ...prev])
    }
    setIsAddEditModalOpen(false)
    setSelectedMaterial(null)
  }

  const handleDelete = (m: Material) => {
    setMaterialToDelete(m)
    setIsConfirmOpen(true)
  }

  const handleDeleteFromView = () => {
    if (selectedMaterial) {
      setMaterialToDelete(selectedMaterial)
      setIsViewModalOpen(false)
      setIsConfirmOpen(true)
    }
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-xl font-bold text-foreground">{t('manageMaterials.title')}</h1>
        <Button
          onClick={handleAdd}
          className="bg-primary hover:bg-primary/90 text-white shrink-0"
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

      <ViewMaterialDetailsModal
        open={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false)
          setSelectedMaterial(null)
        }}
        material={selectedMaterial}
        onEdit={handleOpenEditFromView}
        onDelete={handleDeleteFromView}
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
    </motion.div>
  )
}
