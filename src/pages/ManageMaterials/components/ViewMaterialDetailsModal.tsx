import { ModalWrapper } from '@/components/common'
import type { Material } from '../manageMaterialsData'
import { formatCurrency, formatDate } from '@/utils/formatters'
import { useTranslation } from 'react-i18next'

interface ViewMaterialDetailsModalProps {
  open: boolean
  onClose: () => void
  material: Material | null
}

function DetailRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex justify-between gap-6 py-2 border-b border-gray-50 last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-foreground text-right">{value}</span>
    </div>
  )
}

function formatDateTime(iso?: string): string {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return formatDate(d, 'MMM d, yyyy · h:mm a')
}

export function ViewMaterialDetailsModal({
  open,
  onClose,
  material,
}: ViewMaterialDetailsModalProps) {
  const { t } = useTranslation()

  if (!material) return null

  return (
    <ModalWrapper
      open={open}
      onClose={onClose}
      title={t('manageMaterials.materialDetailsTitle')}
      size="lg"
      className="max-w-lg bg-white"
    >
      <div className="space-y-1">
        <DetailRow label={t('manageMaterials.materialName')} value={material.materialName} />
        <DetailRow label={t('manageMaterials.category')} value={material.category || '—'} />
        <DetailRow
          label={t('manageMaterials.unitPrice')}
          value={formatCurrency(material.unitPrice)}
        />
        <DetailRow label={t('manageMaterials.quantity')} value={material.quantity} />
        <DetailRow label={t('manageMaterials.totalStock')} value={material.stock} />
        <DetailRow
          label={t('manageMaterials.createdAt', 'Created')}
          value={formatDateTime(material.createdAt)}
        />
        <DetailRow
          label={t('manageMaterials.updatedAt', 'Updated')}
          value={formatDateTime(material.updatedAt)}
        />
      </div>
    </ModalWrapper>
  )
}
