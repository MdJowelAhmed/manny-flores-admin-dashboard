import type { EstimateRecord } from '../estimateData'
import { EstimatePreviewModal } from './EstimatePreviewModal'

interface EstimateItemModalProps {
  open: boolean
  onClose: () => void
  item: EstimateRecord | null
  onSign?: (estimate: EstimateRecord, signatureDataUrl: string) => void
}

export function EstimateItemModal({ open, onClose, item, onSign }: EstimateItemModalProps) {
  return (
    <EstimatePreviewModal
      open={open}
      onClose={onClose}
      estimate={item}
      onSign={item?.status === 'pending' ? onSign : undefined}
      readOnly={item?.status !== 'pending'}
    />
  )
}
