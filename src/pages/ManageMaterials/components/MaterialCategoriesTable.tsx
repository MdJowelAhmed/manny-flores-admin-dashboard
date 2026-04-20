import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import type { MaterialCategory } from '@/types'

interface MaterialCategoriesTableProps {
  categories: MaterialCategory[]
  onEdit: (c: MaterialCategory) => void
  onDelete: (c: MaterialCategory) => void
}

export function MaterialCategoriesTable({
  categories,
  onEdit,
  onDelete,
}: MaterialCategoriesTableProps) {
  const { t } = useTranslation()

  return (
    <div className="w-full overflow-auto">
      <table className="w-full min-w-[480px]">
        <thead>
          <tr className="bg-secondary-foreground text-slate-800">
            <th className="px-5 py-4 text-left text-sm font-bold">
              {t('manageMaterials.categoryName')}
            </th>
            <th className="px-5 py-4 text-left text-sm font-bold">
              {t('manageMaterials.categoryLastUpdated')}
            </th>
            <th className="px-5 py-4 text-right text-sm font-bold">
              {t('manageMaterials.action')}
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {categories.length === 0 ? (
            <tr>
              <td colSpan={3} className="px-5 py-8 text-center text-gray-500">
                {t('manageMaterials.noCategoriesYet')}
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
                      {t('common.edit')}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(c)}
                      className="text-red-600 hover:text-red-700"
                    >
                      {t('common.delete')}
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
