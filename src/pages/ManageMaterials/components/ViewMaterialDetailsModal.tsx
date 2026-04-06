import { ModalWrapper } from '@/components/common'
import type { Material } from '../manageMaterialsData'
import { formatCurrency } from '@/utils/formatters'
import { getAvailableStock } from '../manageMaterialsData'
import { useTranslation } from 'react-i18next'

interface ViewMaterialDetailsModalProps {
  open: boolean
  onClose: () => void
  material: Material | null
}

function DetailRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex justify-between gap-6 py-2">
      <span className="text-sm text-muted-foreground">{label}:</span>
      <span className="text-sm font-medium text-foreground text-right">{value}</span>
    </div>
  )
}

export function ViewMaterialDetailsModal({
  open,
  onClose,
  material,
}: ViewMaterialDetailsModalProps) {
  const { t } = useTranslation()

  if (!material) return null

  const available = getAvailableStock(material)
  const rows = material.jobAllocations ?? []

  return (
    <ModalWrapper
      open={open}
      onClose={onClose}
      title={t('manageMaterials.materialDetailsTitle')}
      size="lg"
      className="max-w-2xl bg-white"
    >
      <div className="space-y-8">
        <div>
          <h3 className="text-sm font-bold text-foreground mb-3">
            {t('manageMaterials.materialOverview')}
          </h3>
          <div className="space-y-0.5">
            <DetailRow
              label={t('manageMaterials.materialName')}
              value={material.materialName}
            />
            <DetailRow label={t('manageMaterials.category')} value={material.category} />
            <DetailRow label={t('manageMaterials.unit')} value={material.unit} />
            <DetailRow
              label={t('manageMaterials.totalStock')}
              value={material.currentStock}
            />
            <DetailRow
              label={t('manageMaterials.allocated')}
              value={material.allocated}
            />
            <DetailRow
              label={t('manageMaterials.availableStock')}
              value={available}
            />
            <DetailRow
              label={t('manageMaterials.unitPrice')}
              value={formatCurrency(material.unitPrice)}
            />
            <DetailRow
              label={t('manageMaterials.projectRate')}
              value={formatCurrency(material.projectRate)}
            />
          </div>
        </div>

        <div>
          <h3 className="text-sm font-bold text-foreground mb-3">
            {t('manageMaterials.activeJobAllocation')}
          </h3>
          <div className="overflow-hidden rounded-lg border border-gray-200">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left text-slate-700">
                  <th className="px-4 py-2.5 font-semibold">
                    {t('manageMaterials.jobName')}
                  </th>
                  <th className="px-4 py-2.5 font-semibold">{t('manageMaterials.qty')}</th>
                  <th className="px-4 py-2.5 font-semibold">
                    {t('manageMaterials.totalCost')}
                  </th>
                  <th className="px-4 py-2.5 font-semibold">
                    {t('manageMaterials.jobStatus')}
                  </th>
                  <th className="px-4 py-2.5 font-semibold">{t('manageMaterials.date')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {rows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-6 text-center text-muted-foreground"
                    >
                      {t('manageMaterials.noJobAllocations')}
                    </td>
                  </tr>
                ) : (
                  rows.map((row) => (
                    <tr key={row.id}>
                      <td className="px-4 py-3 text-slate-800">{row.projectName}</td>
                      <td className="px-4 py-3 text-slate-700">{row.qty}</td>
                      <td className="px-4 py-3 text-slate-700">
                        {formatCurrency(row.totalCost)}
                      </td>
                      <td className="px-4 py-3 font-medium text-blue-600">{row.status}</td>
                      <td className="px-4 py-3 text-slate-600">{row.date}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </ModalWrapper>
  )
}
