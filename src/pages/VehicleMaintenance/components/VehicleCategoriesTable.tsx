import { Button } from '@/components/ui/button'
import type { VehicleCategory } from '@/types'

interface VehicleCategoriesTableProps {
  categories: VehicleCategory[]
  onEdit: (c: VehicleCategory) => void
  onDelete: (c: VehicleCategory) => void
}

export function VehicleCategoriesTable({
  categories,
  onEdit,
  onDelete,
}: VehicleCategoriesTableProps) {
  return (
    <div className="w-full overflow-auto">
      <table className="w-full min-w-[480px]">
        <thead>
          <tr className="bg-secondary-foreground text-slate-800">
            <th className="px-5 py-4 text-left text-sm font-bold">Category Name</th>
            <th className="px-5 py-4 text-left text-sm font-bold">Last Updated</th>
            <th className="px-5 py-4 text-right text-sm font-bold">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {categories.length === 0 ? (
            <tr>
              <td colSpan={3} className="px-5 py-8 text-center text-gray-500">
                No categories yet. Add one to get started.
              </td>
            </tr>
          ) : (
            categories.map((c) => (
              <tr key={c.id} className="hover:bg-gray-50">
                <td className="px-5 py-4 text-sm font-medium text-slate-800">{c.name}</td>
                <td className="px-5 py-4 text-sm text-slate-600">
                  {new Date(c.updatedAt).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </td>
                <td className="px-5 py-4">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(c)}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(c)}
                      className="text-red-600 hover:text-red-700"
                    >
                      Delete
                    </Button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}

