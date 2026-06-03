import type { EstimateRecord } from '../estimateData'
import { EstimatePreviewModal } from './EstimatePreviewModal'

interface EstimateItemModalProps {
  open: boolean
  onClose: () => void
  item: EstimateRecord | null
}

export function EstimateItemModal({ open, onClose, item }: EstimateItemModalProps) {
  return <EstimatePreviewModal open={open} onClose={onClose} estimate={item} />
}
