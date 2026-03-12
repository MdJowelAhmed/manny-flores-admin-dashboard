import { ModalWrapper } from '@/components/common'
import { Button } from '@/components/ui/button'
import type { Material } from '../manageMaterialsData'
import { formatCurrency } from '@/utils/formatters'

interface ViewMaterialDetailsModalProps {
  open: boolean
  onClose: () => void
  material: Material | null
  onEdit: () => void
  onDelete: () => void
}

function DetailRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex justify-between py-2 gap-4">
      <span className="text-sm text-muted-foreground">{label}:</span>
      <span className="text-sm ">{value}</span>
    </div>
  )
}

export function ViewMaterialDetailsModal({
  open,
  onClose,
  material,
  onEdit,
  onDelete,
}: ViewMaterialDetailsModalProps) {
  if (!material) return null

  return (
    <ModalWrapper
      open={open}
      onClose={onClose}
      title="Material Details"
      size="lg"
      className="max-w-2xl bg-white"
    >
      <div className="space-y-5">
        {/* Material Overview */}
        <div>
          <h3 className="text-sm font-semibold mb-3 text-foreground">Material Overview</h3>
          <div className="space-y-1">
            <DetailRow label="Material Name" value={material.materialName} />
            <DetailRow label="Category" value={material.category} />
            <DetailRow label="Unit Measure" value={material.unit} />
            <DetailRow label="Available Stock" value={`${material.currentStock}${material.unit}`} />
            <DetailRow label="Unit Price" value={formatCurrency(material.costPrice)} />
            <DetailRow label="Project Rate" value={formatCurrency(material.projectRate)} />
          </div>
        </div>

        {/* Assign Project */}
        <div>
          <h3 className="text-sm font-semibold mb-3 text-foreground">Assign Project</h3>
          <div className="space-y-1.5">
            {material.assignedProjects?.length ? (
              material.assignedProjects.map((p, i) => (
                <div
                  key={i}
                  className="py-2 px-3 rounded-md bg-gray-50 text-sm text-slate-700"
                >
                  {p}
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No projects assigned</p>
            )}
          </div>
        </div>

        {/* Supplier Details */}
        <div>
          <h3 className="text-sm font-semibold mb-3 text-foreground">Supplier Details</h3>
          <div className="space-y-1">
            <DetailRow label="Name" value={material.supplier} />
            <DetailRow label="Email" value={material.supplierEmail} />
            <DetailRow label="Contact" value={material.supplierContact} />
            <DetailRow label="Last Purchase Date" value={material.lastPurchaseDate} />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button
            onClick={onEdit}
            className="bg-primary hover:bg-primary/90 text-white px-6"
          >
            Edit
          </Button>
          <Button variant="destructive" onClick={onDelete} className="bg-destructive hover:bg-destructive/90 text-white">
            Delete
          </Button>
        </div>
      </div>
    </ModalWrapper>
  )
}
