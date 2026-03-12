import { motion } from 'framer-motion'
import { Eye, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Material } from '../manageMaterialsData'
import { formatCurrency } from '@/utils/formatters'

interface MaterialsTableProps {
  materials: Material[]
  onView: (m: Material) => void
  onEdit: (m: Material, e: React.MouseEvent) => void
  onDelete: (m: Material) => void
}

export function MaterialsTable({
  materials,
  onView,
  onEdit,
  onDelete,
}: MaterialsTableProps) {
  return (
    <div className="w-full overflow-auto">
      <table className="w-full min-w-[900px]">
        <thead>
          <tr className="bg-secondary-foreground text-accent">
            <th className="px-6 py-4 text-left text-sm font-semibold">Material Name</th>
            <th className="px-6 py-4 text-left text-sm font-semibold">Category</th>
            <th className="px-6 py-4 text-left text-sm font-semibold">Unit</th>
            <th className="px-6 py-4 text-left text-sm font-semibold">Current Stock</th>
            <th className="px-6 py-4 text-left text-sm font-semibold">Supplier</th>
            <th className="px-6 py-4 text-left text-sm font-semibold">Cost Price</th>
            <th className="px-6 py-4 text-left text-sm font-semibold">Project Rate</th>
            <th className="px-6 py-4 text-left text-sm font-semibold">Assigned Project</th>
            <th className="px-6 py-4 text-right text-sm font-semibold">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white">
          {materials.length === 0 ? (
            <tr>
              <td colSpan={9} className="px-4 py-8 text-center text-muted-foreground text-sm">
                No materials found
              </td>
            </tr>
          ) : (
            materials.map((item, index) => (
              <motion.tr
                key={item.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.02 * index }}
                className="hover:bg-gray-50/50 transition-colors shadow-sm"
              >
                <td className="px-4 py-3 text-sm text-slate-800">{item.materialName}</td>
                <td className="px-4 py-3 text-sm text-slate-600">{item.category}</td>
                <td className="px-4 py-3 text-sm text-slate-600">{item.unit}</td>
                <td className="px-4 py-3 text-sm text-slate-600">{item.currentStock}</td>
                <td className="px-4 py-3 text-sm text-slate-600">{item.supplier}</td>
                <td className="px-4 py-3 text-sm text-slate-600">
                  {formatCurrency(item.costPrice)}
                </td>
                <td className="px-4 py-3 text-sm text-slate-600">
                  {formatCurrency(item.projectRate)}
                </td>
                <td className="px-4 py-3 text-sm text-slate-600">{item.assignedProject}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => onView(item)}
                      className="h-8 w-8 text-primary hover:bg-primary/10"
                    >
                      <Eye className="h-5 w-5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={(e) => onEdit(item, e)}
                      className="h-8 w-8 text-primary hover:bg-primary/10"
                    >
                      <Pencil className="h-5 w-5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => onDelete(item)}
                      className="h-8 w-8 text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </div>
                </td>
              </motion.tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
